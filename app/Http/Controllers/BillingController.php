<?php

namespace App\Http\Controllers;

use App\Models\Billing;
use App\Models\BillingFile;
use App\Models\Project;
use App\Support\Hashid;
use App\Traits\HandlesActivityLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class BillingController extends Controller
{
    use HandlesActivityLog;

    public function index(Request $request)
    {
        $query = Project::with(['billing.handle', 'pic', 'auctionType', 'budgetType']);

        // Filtering
        $query->when($request->search, function ($q, $search) {
            $q->where(function ($sub) use ($search) {
                $sub->where('name', 'like', "%{$search}%")
                    ->orWhere('up_no', 'like', "%{$search}%");
            });
        });

        if ($request->status && $request->status !== 'Semua Status') {
            $query->whereHas('billing', function($q) use ($request) {
                $q->where('status', $request->status);
            });
        }

        if ($request->my_data === 'true') {
            $query->where('pic_id', $request->user()->id);
        }

        $sortColumn = $request->tableSortColumn ?? 'id';
        $sortDirection = $request->tableSortDirection ?? 'desc';
        
        $columnMap = [
            'upNo' => 'up_no',
            'contractDate' => 'contract_date',
            'dueDate' => 'due_date',
            'budgetType' => 'budget_year',
            'company' => 'company_id',
        ];

        $dbSortColumn = $columnMap[$sortColumn] ?? $sortColumn;

        if ($sortColumn === 'progres') {
            $query->orderByRaw('
                COALESCE((
                    SELECT CAST(SUM(CASE WHEN billing_items.completed = true THEN 1 ELSE 0 END) AS FLOAT) / NULLIF(COUNT(billing_items.id), 0) * 100 
                    FROM billing_items 
                    INNER JOIN billings ON billings.id = billing_items.billing_id 
                    WHERE billings.project_id = projects.id
                ), 0) ' . $sortDirection
            );
        } else {
            $query->orderBy($dbSortColumn, $sortDirection);
        }

        $projects = $query->paginate(10)->through(function ($project) {
            $b = $project->billing;
            $items = $b ? $b->items : collect();
            $progres = 0;
            if ($items->count() > 0) {
                $progres = min(100, (int)round(($items->where('completed', true)->count() / $items->count()) * 100));
            }

            return [
                'id' => $project->id,
                'hashed_id' => Hashid::encode($project->id),
                'name' => $project->name,
                'upNo' => $project->up_no,
                'budgetType' => $project->budgetType?->name,
                'pic' => $project->pic,
                'handle' => $b && $b->handle ? $b->handle : null,
                'contractDate' => $project->created_at, // Adjust if you have actual contractdate
                'dueDate' => $project->created_at->addMonths(6), // adjust logic accordingly
                'progres' => $progres,
                'status' => $b?->status ?? 'Ongoing',
                'company' => 'Awaiting Data', // Example fallback
            ];
        });

        // Optional: you can override projects inside the render if you don't wanna re-wire the entire Index.jsx immediately.
        return Inertia::render('Billing/Index', [
            'projects' => $projects,
            'queryParams' => $request->query(),
        ]);
    }

    public function edit($hashedId)
    {
        $id = Hashid::decode($hashedId);
        $project = Project::with(['billing.basts', 'billing.items', 'billing.files', 'billing.lastModifier', 'pic', 'budgetType'])->findOrFail($id);

        $billing = $project->billing ?? $project->billing()->create(['status' => 'Ongoing']);

        $auth_user = request()->user();
        
        // Permission logic for Billing
        $isPicOrAdmin = $auth_user->id === $project->pic_id || $auth_user->role === 'admin';
        $isProjectActive = !in_array($project->status, ['Pending', 'Completed']);
        $canEdit = $isPicOrAdmin && $isProjectActive;

        return Inertia::render('Billing/Edit', [
            'project' => [
                'hashed_id' => Hashid::encode($project->id),
                'name' => $project->name,
                'up_no' => $project->up_no,
                'contract_no' => $project->contract_no ?? '—',
                'budget_year' => $project->budgetType?->name ?? '—',
                'pic' => $project->pic,
                'status' => $billing->status,
                'project_status' => $project->status,
                'last_modifier' => $billing->lastModifier?->name ?? 'Belum ada data',
            ],
            'billing' => [
                'status' => $billing->status,
                'basts' => $billing->basts->count() ? $billing->basts : [['no_bast' => '', 'tgl_bast' => '']],
                'billing_items' => $billing->items->count() ? $billing->items : [['name' => '', 'type' => 'Pelunasan', 'completed' => false]],
                'files' => $billing->files->map(function($file) {
                    return [
                        'id' => $file->id,
                        'name' => $file->file_name,
                        'size' => $file->file_size,
                        'type' => $file->file_type,
                        'url' => Storage::url($file->file_path),
                    ];
                }),
            ],
            'auth_user' => $auth_user,
            'canEdit' => $canEdit,
        ]);
    }

    public function update(Request $request, $hashedId)
    {
        $id = Hashid::decode($hashedId);
        $project = Project::findOrFail($id);

        $auth_user = $request->user();
        $isPicOrAdmin = $auth_user->id === $project->pic_id || $auth_user->role === 'admin';
        $isProjectActive = !in_array($project->status, ['Pending', 'Completed']);
        
        if (!($isPicOrAdmin && $isProjectActive)) {
            return back()->with('error', 'Data tidak bisa diubah karena status Project ' . $project->status . ' atau Anda tidak berwenang.');
        }

        $billing = $project->billing ?? $project->billing()->create(['status' => 'Ongoing']);

        $oldStatus = $billing->status;

        DB::beginTransaction();
        try {
            $updateData = [
                'status' => $request->status,
                'last_modifier_id' => $auth_user->id,
            ];

            if ($billing->handle_id === null) {
                $updateData['handle_id'] = $auth_user->id;
            }

            $billing->update($updateData);

            // Sync BASTs
            $billing->basts()->delete();
            if ($request->basts && is_array($request->basts)) {
                $validBasts = collect($request->basts)->filter(fn($b) => !empty($b['no_bast']))->toArray();
                $billing->basts()->createMany($validBasts);
            }

            // Sync Items
            $billing->items()->delete();
            if ($request->billing_items && is_array($request->billing_items)) {
                $validItems = collect($request->billing_items)->filter(fn($i) => !empty($i['name']))->map(function($i) {
                    return [
                        'name' => $i['name'],
                        'type' => $i['type'],
                        'completed' => filter_var($i['completed'] ?? false, FILTER_VALIDATE_BOOLEAN)
                    ];
                })->toArray();
                $billing->items()->createMany($validItems);
            }

            // Upload files (assuming they're coming in as new_files or files)
            if ($request->hasFile('new_files')) {
                foreach ($request->file('new_files') as $file) {
                    $fileName = time() . '_' . $file->getClientOriginalName();
                    $filePath = $file->storeAs('billing_files', $fileName, 'public');

                    $billing->files()->create([
                        'file_name' => $file->getClientOriginalName(),
                        'file_path' => $filePath,
                        'file_size' => $file->getSize(),
                        'file_type' => $file->getClientMimeType()
                    ]);
                }
            }

            // Force touch for timestamps
            $billing->touch();
            DB::commit();

            $billing->project->refresh()->updateProgress();

            $billing->refresh();
            $itemsCount = $billing->items()->count();
            $progress = $itemsCount > 0 ? min(100, (int)round(($billing->items()->where('completed', true)->count() / $itemsCount) * 100)) : 0;
            if ($billing->wasChanged() && ($progress == 100 || $oldStatus !== $billing->status)) {
                \Illuminate\Support\Facades\Notification::send(\App\Models\User::where('id', '!=', auth()->id())->get(), new \App\Notifications\ModuleProgressNotification('billing', $billing->status, $auth_user, $project->name, $project->id, $progress));
            }

            return back()->with('success', 'Data penagihan berhasil diperbarui.');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'Gagal memperbarui data penagihan. ' . $e->getMessage()]);
        }
    }

    public function deleteFile($fileId)
    {
        $file = BillingFile::with('billing.project')->findOrFail($fileId);
        $project = $file->billing->project;
        
        $auth_user = request()->user();
        $isPicOrAdmin = $auth_user->id === $project->pic_id || $auth_user->role === 'admin';
        $isProjectActive = !in_array($project->status, ['Pending', 'Completed']);
        
        if (!($isPicOrAdmin && $isProjectActive)) {
            return back()->with('error', 'Tidak bisa menghapus file karena status Project ' . $project->status . ' atau Anda tidak berwenang.');
        }

        if (Storage::disk('public')->exists($file->file_path)) {
            Storage::disk('public')->delete($file->file_path);
        }
        
        $billing = end($file->billing); // if we need it
        $file->delete();

        return back()->with('success', 'File berhasil dihapus.');
    }
}
