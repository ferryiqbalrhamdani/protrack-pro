<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Models\Shipping;
use App\Models\ShippingDocument;
use App\Models\ShippingFile;
use App\Support\Hashid;
use App\Traits\HandlesActivityLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class ShippingController extends Controller
{
    use HandlesActivityLog;

    public function index(Request $request)
    {
        $query = Project::with(['shipping.handle', 'pic', 'auctionType', 'budgetType', 'company']);

        // Filtering
        $query->when($request->search, function ($q, $search) {
            $q->where(function ($sub) use ($search) {
                $sub->where('name', 'like', "%{$search}%")
                    ->orWhere('up_no', 'like', "%{$search}%");
            });
        });

        if ($request->status && $request->status !== 'Semua Status') {
            $query->whereHas('shipping', function($q) use ($request) {
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
            // Sort by a raw calculation of shipping progress
            // Progress = (status weight) + count(documents) + count(files) etc.
            // A simpler approach for sorting without complex SQL is sorting by status first,
            // or we could do a Raw DB query. Let's just sort by status which roughly correlates to progress
            $query->orderBy(
                Shipping::select('status')
                    ->whereColumn('project_id', 'projects.id')
                    ->limit(1),
                $sortDirection
            );
        } else {
            $query->orderBy($dbSortColumn, $sortDirection);
        }

        $projects = $query->paginate(10)->through(function ($project) {
            $s = $project->shipping;
            $progres = 0;
            if ($s) {
                $total = 1; // shipping_date
                $filled = 0;
                
                if ($s->shipping_date) $filled++;

                foreach ($s->documents as $doc) {
                    $total += 2; // no and date
                    if ($doc->doc_no) $filled++;
                    if ($doc->doc_date) $filled++;
                }
                
                $progres = round(($filled / max(1, $total)) * 100);
                
                if ($s->status === 'Completed') {
                    $progres = 100; // Force 100 if completed
                }
            }

            return [
                'id' => $project->id,
                'hashed_id' => Hashid::encode($project->id),
                'name' => $project->name,
                'upNo' => $project->up_no,
                'no_kontrak' => $project->contract_no,
                'budgetType' => $project->budgetType?->name,
                'pic' => $project->pic,
                'handle' => $s && $s->handle ? $s->handle : null,
                'contractDate' => $project->contract_date ?? $project->created_at,
                'dueDate' => $project->due_date ?? $project->created_at->addMonths(6),
                'progres' => $progres,
                'status' => $s?->status ?? 'Pending',
                'company' => $project->company?->name ?? 'Awaiting Data',
            ];
        });

        return Inertia::render('Shipping/Index', [
            'projects' => $projects,
            'queryParams' => $request->query(),
        ]);
    }

    public function edit($hashedId)
    {
        $id = Hashid::decode($hashedId);
        $project = Project::with(['shipping.documents', 'shipping.files', 'shipping.lastModifier', 'pic', 'budgetType'])->findOrFail($id);

        $shipping = $project->shipping ?? $project->shipping()->create(['status' => 'Ongoing']);

        $auth_user = request()->user();
        
        // Permission logic for Shipping
        $isSuperAdmin = $auth_user->hasRole('Super Admin') || $auth_user->username === 'admin';
        $isProjectActive = !in_array($project->status, ['Pending', 'Completed']);
        $isHandler = $shipping->handle_id === null || $shipping->handle_id === $auth_user->id;
        $canEdit = $auth_user->can('view_shipping') && ($isSuperAdmin || $isHandler) && $isProjectActive;

        return Inertia::render('Shipping/Edit', [
            'project' => [
                'hashed_id' => Hashid::encode($project->id),
                'name' => $project->name,
                'up_no' => $project->up_no,
                'contract_no' => $project->contract_no ?? '—',
                'budget_year' => $project->budgetType?->name ?? '—',
                'pic' => $project->pic,
                'status' => $shipping->status,
                'project_status' => $project->status,
                'last_modifier' => $shipping->lastModifier?->name ?? 'Belum ada modifikasi',
            ],
            'shipping' => [
                'id' => $shipping->id,
                'status' => $shipping->status,
                'shipping_type' => $shipping->shipping_type,
                'shipping_date' => $shipping->shipping_date,
                'ba_anname' => $shipping->documents->where('type', 'anname')->count() 
                    ? $shipping->documents->where('type', 'anname')->values()->map(fn($d) => ['no' => $d->doc_no, 'date' => $d->doc_date])
                    : [['no' => '', 'date' => '']],
                'ba_inname' => $shipping->documents->where('type', 'inname')->count() 
                    ? $shipping->documents->where('type', 'inname')->values()->map(fn($d) => ['no' => $d->doc_no, 'date' => $d->doc_date])
                    : [['no' => '', 'date' => '']],
                'files' => $shipping->files->map(function($file) {
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
        $request->validate([
            'new_files.*' => 'nullable|file|max:5120',
        ]);

        $id = Hashid::decode($hashedId);
        $project = Project::with(['shipping'])->findOrFail($id);
        
        $auth_user = $request->user();
        $shipping = $project->shipping;
        $isSuperAdmin = $auth_user->hasRole('Super Admin') || $auth_user->username === 'admin';
        $isProjectActive = !in_array($project->status, ['Pending', 'Completed']);
        $isHandler = $shipping->handle_id === null || $shipping->handle_id === $auth_user->id;
        
        if (!($auth_user->can('view_shipping') && ($isSuperAdmin || $isHandler)) || !$isProjectActive) {
            $message = 'Anda tidak memiliki akses untuk mengubah data ini.';
            if (!$isProjectActive) {
                $message = 'Data tidak bisa diubah karena status Project ' . $project->status . '.';
            } elseif (!$isHandler) {
                $message = 'Data ini sudah ditangani oleh user lain.';
            }
            return back()->with('error', $message);
        }

        $request->validate([
            'status' => 'nullable|string',
            'shipping_type' => 'nullable|string',
            'shipping_date' => 'nullable|date',
            'ba_anname' => 'array',
            'ba_inname' => 'array',
        ]);

        $shipping = $project->shipping;

        $oldStatus = $shipping->status;

        DB::beginTransaction();
        try {
            $updateData = [
                'status' => $request->status,
                'shipping_type' => $request->shipping_type,
                'shipping_date' => $request->shipping_date,
                'last_modifier_id' => $auth_user->id,
            ];

            if ($shipping->handle_id === null) {
                $updateData['handle_id'] = $auth_user->id;
            }

            $shipping->update($updateData);

            ShippingDocument::where('shipping_id', $shipping->id)->delete();

            if ($request->shipping_type === 'Lengkap') {
                $annameRow = $request->ba_anname[0] ?? null;
                if ($annameRow && (!empty($annameRow['no']) || !empty($annameRow['date']))) {
                    $shipping->documents()->create([
                        'type' => 'anname',
                        'doc_no' => $annameRow['no'] ?? null,
                        'doc_date' => $annameRow['date'] ?? null,
                    ]);
                }

                $innameRow = $request->ba_inname[0] ?? null;
                if ($innameRow && (!empty($innameRow['no']) || !empty($innameRow['date']))) {
                    $shipping->documents()->create([
                        'type' => 'inname',
                        'doc_no' => $innameRow['no'] ?? null,
                        'doc_date' => $innameRow['date'] ?? null,
                    ]);
                }
            } else {
                if (is_array($request->ba_anname)) {
                    foreach ($request->ba_anname as $row) {
                        if (!empty($row['no']) || !empty($row['date'])) {
                            $shipping->documents()->create([
                                'type' => 'anname',
                                'doc_no' => $row['no'] ?? null,
                                'doc_date' => $row['date'] ?? null,
                            ]);
                        }
                    }
                }
                
                if (is_array($request->ba_inname)) {
                    foreach ($request->ba_inname as $row) {
                        if (!empty($row['no']) || !empty($row['date'])) {
                            $shipping->documents()->create([
                                'type' => 'inname',
                                'doc_no' => $row['no'] ?? null,
                                'doc_date' => $row['date'] ?? null,
                            ]);
                        }
                    }
                }
            }

            if ($request->hasFile('new_files')) {
                foreach ($request->file('new_files') as $file) {
                    $originalName = $file->getClientOriginalName();
                    $path = $file->store('shippings/' . $shipping->id . '/files', 'public');
                    
                    $shipping->files()->create([
                        'file_name' => $originalName,
                        'file_path' => $path,
                        'file_size' => $file->getSize(),
                        'file_type' => $file->getMimeType(),
                    ]);
                }
            }

            $this->logActivity('telah memperbarui data pengiriman', 'Shipping', $project->name, 'local_shipping', 'text-teal-500');

            DB::commit();
            
            $project->refresh()->updateProgress();
            
            $shipping->refresh();
            $progress = 0;
            $total = 1; 
            $filled = 0;
            if ($shipping->shipping_date) $filled++;
            foreach ($shipping->documents as $doc) {
                $total += 2; 
                if ($doc->doc_no) $filled++;
                if ($doc->doc_date) $filled++;
            }
            $progress = round(($filled / max(1, $total)) * 100);
            if ($shipping->status === 'Completed') $progress = 100;

            // Trigger notification on any update (status, date, documents, or files)
            /** @var \App\Models\User $authUser */
            $authUser = auth()->user();
            $recipients = \App\Models\User::where('id', '!=', $authUser->id)->get();
            \Illuminate\Support\Facades\Notification::send($recipients, new \App\Notifications\ModuleProgressNotification('shipping', $shipping->status, $authUser, $project->name, $project->id, $progress));
            
            return back()->with('success', 'Data pengiriman berhasil disimpan.');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'Terjadi kesalahan: ' . $e->getMessage());
        }
    }

    public function deleteFile($fileId)
    {
        $file = ShippingFile::with('shipping.project')->findOrFail($fileId);
        
        $project = $file->shipping->project;
        $auth_user = request()->user();
        
        $isSuperAdmin = $auth_user->hasRole('Super Admin') || $auth_user->username === 'admin';
        $isProjectActive = !in_array($project->status, ['Pending', 'Completed']);
        $isHandler = $file->shipping->handle_id === null || $file->shipping->handle_id === $auth_user->id;
        
        if (!($auth_user->can('view_shipping') && ($isSuperAdmin || $isHandler)) || !$isProjectActive) {
            $message = 'Anda tidak memiliki akses untuk menghapus file ini.';
            if (!$isProjectActive) {
                $message = 'Tidak bisa menghapus file karena status Project ' . $project->status . '.';
            } elseif (!$isHandler) {
                $message = 'File ini milik data yang sudah ditangani oleh user lain.';
            }
            return back()->with('error', $message);
        }

        try {
            Storage::disk('public')->delete($file->file_path);
            
            $fileName = $file->file_name;
            $file->delete();
            
            $this->logActivity('telah menghapus file pengiriman', 'Shipping', $fileName, 'delete', 'text-rose-500');

            // Notify on file deletion
            $progress = 0;
            $total = 1; $filled = 0;
            if ($file->shipping->shipping_date) $filled++;
            foreach ($file->shipping->documents as $doc) {
                $total += 2; 
                if ($doc->doc_no) $filled++;
                if ($doc->doc_date) $filled++;
            }
            $progress = round(($filled / max(1, $total)) * 100);
            if ($file->shipping->status === 'Completed') $progress = 100;

            /** @var \App\Models\User $authUser */
            $authUser = auth()->user();
            $recipients = \App\Models\User::where('id', '!=', $authUser->id)->get();
            \Illuminate\Support\Facades\Notification::send($recipients, new \App\Notifications\ModuleProgressNotification('shipping', $file->shipping->status, $authUser, $project->name, $project->id, $progress));
            
            return back()->with('success', 'File berhasil dihapus.');
        } catch (\Exception $e) {
            return back()->with('error', 'Gagal menghapus file.');
        }
    }
}
