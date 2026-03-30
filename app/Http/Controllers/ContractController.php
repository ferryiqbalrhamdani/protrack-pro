<?php

namespace App\Http\Controllers;

use App\Models\Contract;
use App\Models\ContractAttachment;
use App\Models\ContractStep;
use App\Models\Project;
use App\Support\Hashid;
use App\Traits\HandlesActivityLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class ContractController extends Controller
{
    use HandlesActivityLog;

    public function index(Request $request)
    {
        $contracts = Contract::with(['project.company', 'project.pic', 'handle'])
            ->join('projects', 'contracts.project_id', '=', 'projects.id')
            ->orderByDesc('projects.created_at')
            ->select('contracts.*')
            ->paginate(10)
            ->through(function ($contract) {
                return [
                    'id' => $contract->id,
                    'hashed_id' => Hashid::encode($contract->id),
                    'name' => $contract->project->name,
                    'category' => $contract->project->auctionType?->name,
                    'up_no' => $contract->project->up_no,
                    'no_kontrak' => $contract->project->contract_no,
                    'company' => $contract->project->company?->name,
                    'status' => $contract->status,
                    'progress' => $contract->progress, 
                    'pic' => [
                        'name' => $contract->project->pic?->name,
                    ],
                    'handle' => $contract->handle ? [
                        'name' => $contract->handle->name,
                    ] : null,
                    'start_date' => $contract->project->contract_date,
                    'end_date' => $contract->project->due_date,
                ];
            });

        // Calculate stats for the dashboard
        $stats = [
            'total_active' => Contract::where('status', 'Ongoing')->count(),
            'completion_rate' => Contract::count() > 0 ? round((Contract::where('status', 'Completed')->count() / Contract::count()) * 100) : 0,
            'due_next_30_days' => Project::whereBetween('due_date', [now(), now()->addDays(30)])->count(),
            'avg_project_time' => 'N/A', // Complex calculation or simplified
        ];

        return Inertia::render('Contract/Index', [
            'contracts' => $contracts,
            'stats' => $stats,
            'auth_user' => $request->user(),
            'queryParams' => request()->query() ?: null,
        ]);
    }

    public function edit(Request $request, $hashedId)
    {
        $id = Hashid::decode($hashedId);

        if (!$id) {
            return redirect()->route('contracts')->with('error', 'Invalid contract ID');
        }

        $contract = Contract::with(['project.pic', 'handle', 'steps', 'attachments', 'project.company', 'project.auctionType', 'lastModifier'])->findOrFail($id);

        $auth_user = $request->user();
        
        // Permission logic
        $isSuperAdmin = $auth_user->hasRole('Super Admin') || $auth_user->username === 'admin';
        $isProjectActive = !in_array($contract->project->status, ['Pending', 'Completed']);
        $isHandler = $contract->handle_id === null || $contract->handle_id === $auth_user->id;
        $canEdit = $auth_user->can('view_contracts') && ($isSuperAdmin || $isHandler) && $isProjectActive;

        $contractData = [
            'id' => $contract->id,
            'hashed_id' => $hashedId,
            'name' => $contract->project->name,
            'no_kontrak' => $contract->project->contract_no, // From project table
            'up_no' => $contract->project->up_no,
            'tahun_anggaran' => $contract->project->budget_year,
            'pic' => [
                'name' => $contract->project->pic?->name,
            ],
            'handle' => $contract->handle ? [
                'name' => $contract->handle->name,
            ] : null,
            'status' => $contract->status,
            'jamlak' => $contract->jamlak,
            'jamlak_nominal' => $contract->jamlak_nominal,
            'jamuka' => $contract->jamuka,
            'jamuka_nominal' => $contract->jamuka_nominal,
            'jamwar' => $contract->jamwar,
            'jamwar_nominal' => $contract->jamwar_nominal,
            'steps' => $contract->steps->map(function($step) {
                return [
                    'name' => (string)$step->name,
                    'completed' => (bool)$step->completed,
                ];
            })->values()->all(),
            'attachments' => $contract->attachments->map(function($file) {
                return [
                    'id' => $file->id,
                    'name' => $file->file_name,
                    'size' => $file->file_size,
                    'type' => $file->file_type,
                    'url' => Storage::url($file->file_path),
                ];
            }),
            'project_status' => $contract->project->status,
            'last_modifier' => [
                'name' => $contract->lastModifier?->name ?? 'Belum ada',
            ],
        ];

        return Inertia::render('Contract/Edit', [
            'contract' => $contractData,
            'auth_user' => $auth_user,
            'canEdit' => $canEdit,
        ]);
    }

    public function update(Request $request, $hashedId)
    {
        $id = Hashid::decode($hashedId);
        $contract = Contract::findOrFail($id);
        $auth_user = $request->user();

        // Re-verify permission
        $isSuperAdmin = $auth_user->hasRole('Super Admin') || $auth_user->username === 'admin';
        $isProjectActive = !in_array($contract->project->status, ['Pending', 'Completed']);
        $isHandler = $contract->handle_id === null || $contract->handle_id === $auth_user->id;

        if (!($auth_user->can('view_contracts') && ($isSuperAdmin || $isHandler)) || !$isProjectActive) {
            $message = 'Anda tidak berwenang mengubah data ini.';
            if (!$isProjectActive) {
                $message = 'Data tidak bisa diubah karena status Project ' . $contract->project->status . '.';
            }
            return back()->with('error', $message);
        }

        $validated = $request->validate([
            'status' => 'required|string',
            'jamlak' => 'nullable|string',
            'jamlak_nominal' => 'nullable|numeric',
            'jamuka' => 'nullable|string',
            'jamuka_nominal' => 'nullable|numeric',
            'jamwar' => 'nullable|string',
            'jamwar_nominal' => 'nullable|numeric',
            'steps' => 'array',
            'steps.*.name' => 'required|string',
            'steps.*.completed' => 'boolean',
            'files' => 'array',
            'files.*' => 'file|max:5120',
        ]);

        $oldStatus = $contract->status;

        DB::transaction(function () use ($contract, $validated, $auth_user, $request) {
            // Assign handle if first time
            if ($contract->handle_id === null) {
                $contract->handle_id = $auth_user->id;
            }

            $contract->fill([
                'status' => $validated['status'],
                'jamlak' => $validated['jamlak'],
                'jamlak_nominal' => $validated['jamlak_nominal'] ?? 0,
                'jamuka' => $validated['jamuka'],
                'jamuka_nominal' => $validated['jamuka_nominal'] ?? 0,
                'jamwar' => $validated['jamwar'],
                'jamwar_nominal' => $validated['jamwar_nominal'] ?? 0,
                'last_modifier_id' => $auth_user->id,
            ]);

            $contract->save();

            // Sync Steps
            if (isset($validated['steps'])) {
                $contract->steps()->delete();
                foreach ($validated['steps'] as $index => $stepData) {
                    $contract->steps()->create([
                        'name' => $stepData['name'],
                        'completed' => (bool)$stepData['completed'],
                        'order' => $index,
                    ]);
                }
            }

            // Handle Files
            if ($request->hasFile('files')) {
                foreach ($request->file('files') as $file) {
                    $path = $file->store('contracts/attachments', 'public');
                    $contract->attachments()->create([
                        'file_name' => $file->getClientOriginalName(),
                        'file_path' => $path,
                        'file_type' => $file->getClientMimeType(),
                        'file_size' => $file->getSize(),
                    ]);
                }
            }
        });

        $this->logActivity('telah memperbarui data kontrak', 'Kontrak', $contract->project->name, 'description', 'text-blue-500');

        $contract->project->refresh()->updateProgress();
        
        $progress = $contract->steps()->count() > 0 ? ($contract->steps()->where('completed', true)->count() / $contract->steps()->count()) * 100 : 0;
        
        // Trigger notification on any update (status, jamlak, steps, or files)
        $recipients = \App\Models\User::where('id', '!=', auth()->id())->get();
        \Illuminate\Support\Facades\Notification::send($recipients, new \App\Notifications\ModuleProgressNotification('contract', $contract->status, $auth_user, $contract->project->name, $contract->project_id, $progress));

        $contract->refresh();

        return redirect()->route('contracts')->with('success', 'Perubahan kontrak berhasil disimpan!');
    }

    public function destroyAttachment(ContractAttachment $attachment)
    {
        $auth_user = request()->user();
        // Permission check
        $contract = $attachment->contract;
        $isSuperAdmin = $auth_user->hasRole('Super Admin') || $auth_user->username === 'admin';
        $isProjectActive = !in_array($contract->project->status, ['Pending', 'Completed']);
        $isHandler = $contract->handle_id === null || $contract->handle_id === $auth_user->id;

        if (!($auth_user->can('view_contracts') && ($isSuperAdmin || $isHandler)) || !$isProjectActive) {
            $message = 'Anda tidak berwenang menghapus file ini.';
            if (!$isProjectActive) {
                $message = 'Tidak bisa menghapus file saat status Project ' . $contract->project->status . '.';
            }
            return back()->with('error', $message);
        }

        try {
            // Delete physical file
            if (Storage::disk('public')->exists($attachment->file_path)) {
                Storage::disk('public')->delete($attachment->file_path);
            }

            // Delete database record
            $attachment->delete();

            $this->logActivity('telah menghapus lampiran file kontrak', 'Kontrak', $attachment->file_name, 'delete', 'text-rose-500');

            // Notify on file deletion
            $progress = $contract->steps()->count() > 0 ? ($contract->steps()->where('completed', true)->count() / $contract->steps()->count()) * 100 : 0;
            /** @var \App\Models\User $authUser */
            $authUser = auth()->user();
            $recipients = \App\Models\User::where('id', '!=', $authUser->id)->get();
            \Illuminate\Support\Facades\Notification::send($recipients, new \App\Notifications\ModuleProgressNotification('contract', $contract->status, $authUser, $contract->project->name, $contract->project_id, $progress));

            return back()->with('success', 'File berhasil dihapus.');
        } catch (\Exception $e) {
            return back()->with('error', 'Gagal menghapus file.');
        }
    }
}
