<?php

namespace App\Http\Controllers;

use App\Models\Merchandiser;
use App\Models\MerchandiserFile;
use App\Models\MerchandiserPo;
use App\Models\Project;
use App\Models\Vendor;
use App\Support\Hashid;
use App\Traits\HandlesActivityLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class MerchandiserController extends Controller
{
    use HandlesActivityLog;

    public function index(Request $request)
    {
        $query = Project::with(['merchandiser', 'pic', 'auctionType', 'budgetType']);

        // Filtering
        $query->when($request->search, function ($q, $search) {
            $q->where(function ($sub) use ($search) {
                $sub->where('name', 'like', "%{$search}%")
                    ->orWhere('up_no', 'like', "%{$search}%");
            });
        });

        if ($request->status && $request->status !== 'Semua Status') {
            $query->whereHas('merchandiser', function($q) use ($request) {
                $q->where('status', $request->status);
            });
        }

        if ($request->budget && $request->budget !== 'Semua Anggaran') {
            $query->whereHas('budgetType', function($q) use ($request) {
                $q->where('name', $request->budget);
            });
        }

        if ($request->my_data === 'true') {
            $query->where('pic_id', $request->user()->id);
        }

        // Sorting
        $sortColumn = $request->tableSortColumn ?? 'id';
        $sortDirection = $request->tableSortDirection ?? 'desc';
        
        // Handle sorting by merchandiser fields if needed
        if (in_array($sortColumn, ['progres', 'status', 'barangDikontrak', 'barangDiterima'])) {
            // These are mapped names in frontend, need to map to DB
            $dbMap = [
                'progres' => 'progres', // Need to calculate perhaps?
                'status' => 'status',
                'barangDikontrak' => 'contract_item',
                'barangDiterima' => 'rec_item'
            ];
            $sortColumn = $dbMap[$sortColumn] ?? 'id';
            
            $query->join('merchandisers', 'projects.id', '=', 'merchandisers.project_id')
                  ->orderBy('merchandisers.' . $sortColumn, $sortDirection)
                  ->select('projects.*');
        } else {
            $query->orderBy($sortColumn, $sortDirection);
        }

        $projects = $query->paginate(10)->through(function ($project) {
            $m = $project->merchandiser;
            $progres = 0;
            if ($m && $m->contract_ea > 0) {
                $progres = min(100, (int)round(($m->rec_ea / $m->contract_ea) * 100));
            }

            return [
                'id' => $project->id,
                'hashed_id' => Hashid::encode($project->id),
                'name' => $project->name,
                'upNo' => $project->up_no,
                'no_kontrak' => $project->contract_no,
                'budgetType' => $project->budgetType?->name,
                'pic' => $project->pic?->name,
                'progres' => $progres,
                'status' => $m?->status ?? 'Ongoing',
                'barang_dikontrak' => $m?->contract_item ?? 0,
                'barang_diterima' => $m?->rec_item ?? 0,
            ];
        });

        // Summary Stats (Filtered)
        $summary = [
            'total_dikontrak' => (clone $query)->get()->sum(fn($p) => $p->merchandiser?->contract_item ?? 0),
            'total_diterima'  => (clone $query)->get()->sum(fn($p) => $p->merchandiser?->rec_item ?? 0),
        ];
        $summary['total_belum_diterima'] = max(0, $summary['total_dikontrak'] - $summary['total_diterima']);

        return Inertia::render('Merchandiser/Index', [
            'projects' => $projects,
            'summary' => $summary,
            'queryParams' => $request->query(),
        ]);
    }

    public function edit(Request $request, $hashedId)
    {
        $id = Hashid::decode($hashedId);
        $project = Project::with(['merchandiser.pos.invoices', 'merchandiser.files', 'pic', 'vendors'])->findOrFail($id);
        
        // Ensure Merchandiser record exists
        $merchandiser = $project->merchandiser;
        if (!$merchandiser) {
            $merchandiser = Merchandiser::create([
                'project_id' => $project->id,
                'status' => 'Ongoing'
            ]);
            $merchandiser->load(['pos.invoices', 'files', 'lastModifier']);
        }

        $auth_user = $request->user();
        
        $isSuperAdmin = $auth_user->hasRole('Super Admin') || $auth_user->username === 'admin';
        $isPic = $auth_user->id === $project->pic_id;
        $isProjectActive = !in_array($project->status, ['Pending', 'Completed']);
        $canEdit = ($isPic || $isSuperAdmin) && $isProjectActive;

        $vendors = Vendor::all(['id', 'name']);

        return Inertia::render('Merchandiser/Edit', [
            'project' => [
                'id' => $project->id,
                'hashed_id' => $hashedId,
                'name' => $project->name,
                'contract_no' => $project->contract_no,
                'up_no' => $project->up_no,
                'pic' => $project->pic?->name,
                'status' => $project->status,
            ],
            'merchandiser' => [
                'id' => $merchandiser->id,
                'last_modifier' => $merchandiser->lastModifier?->name ?? 'Belum ada data',
                'bank_name' => $merchandiser->bank_name,
                'account_number' => $merchandiser->account_number,
                'account_name' => $merchandiser->account_name,
                'contract_item' => $merchandiser->contract_item,
                'contract_ea' => $merchandiser->contract_ea,
                'shipping_produksi_item' => $merchandiser->prod_item,
                'shipping_produksi_ea' => $merchandiser->prod_ea,
                'shipping_produksi_etd' => $merchandiser->prod_etd,
                'shipping_pengiriman_item' => $merchandiser->ship_item,
                'shipping_pengiriman_ea' => $merchandiser->ship_ea,
                'shipping_pengiriman_etd' => $merchandiser->ship_etd,
                'shipping_stok_item' => $merchandiser->stock_item,
                'shipping_stok_ea' => $merchandiser->stock_ea,
                'shipping_penerimaan_item' => $merchandiser->rec_item,
                'shipping_penerimaan_ea' => $merchandiser->rec_ea,
                'status' => $merchandiser->status,
                'pos' => $merchandiser->pos->map(fn($po) => [
                    'id' => $po->id,
                    'vendor_id' => $po->vendor_id,
                    'supplier_name' => $po->vendor?->name ?? $po->supplier_name_manual,
                    'po_number' => $po->po_number,
                    'item_count' => $po->item_count,
                    'ea_count' => $po->ea_count,
                    'invoices' => $po->invoices->map(fn($inv) => [
                        'id' => $inv->id,
                        'invoice_number' => $inv->invoice_number,
                        'invoice_date' => $inv->invoice_date,
                        'item_count' => $inv->item_count,
                        'ea_count' => $inv->ea_count,
                        'status' => $inv->status,
                    ])
                ]),
                'files' => $merchandiser->files->map(fn($f) => [
                    'id' => $f->id,
                    'name' => $f->file_name,
                    'size' => round($f->file_size / 1024, 2) . ' KB',
                    'url' => Storage::url($f->file_path),
                ])
            ],
            'vendors' => $vendors,
            'canEdit' => $canEdit,
            'isReviewMode' => !$isProjectActive,
        ]);
    }

    public function update(Request $request, $hashedId)
    {
        $id = Hashid::decode($hashedId);
        $project = Project::findOrFail($id);
        $merchandiser = Merchandiser::where('project_id', $project->id)->firstOrFail();

        $auth_user = $request->user();
        $isSuperAdmin = $auth_user->hasRole('Super Admin') || $auth_user->username === 'admin';
        $isPic = $auth_user->id === $project->pic_id;
        $isProjectActive = !in_array($project->status, ['Pending', 'Completed']);

        if (!($isPic || $isSuperAdmin) || !$isProjectActive) {
            $message = 'Anda tidak berwenang mengubah data ini.';
            if (!$isProjectActive) {
                $message = 'Data tidak bisa diubah karena status Project ' . $project->status . '.';
            }
            return back()->with('error', $message);
        }

        // Pre-process inputs: Convert temporary IDs (new_...) to null
        $input = $request->all();
        if (isset($input['pos']) && is_array($input['pos'])) {
            foreach ($input['pos'] as $poIdx => $po) {
                if (isset($po['id']) && str_starts_with($po['id'], 'new_')) {
                    $input['pos'][$poIdx]['id'] = null;
                }
                if (isset($po['invoices']) && is_array($po['invoices'])) {
                    foreach ($po['invoices'] as $invIdx => $inv) {
                        if (isset($inv['id']) && str_starts_with($inv['id'], 'new_')) {
                            $input['pos'][$poIdx]['invoices'][$invIdx]['id'] = null;
                        }
                    }
                }
            }
        }
        $request->merge($input);

        $validated = $request->validate([
            // Tab 1
            'bank_name' => 'nullable|string',
            'account_number' => 'nullable|string',
            'account_name' => 'nullable|string',
            'contract_item' => 'nullable|numeric',
            'contract_ea' => 'nullable|numeric',
            
            // Tab 3
            'shipping_produksi_item' => 'nullable|numeric',
            'shipping_produksi_ea' => 'nullable|numeric',
            'shipping_produksi_etd' => 'nullable|date',
            'shipping_pengiriman_item' => 'nullable|numeric',
            'shipping_pengiriman_ea' => 'nullable|numeric',
            'shipping_pengiriman_etd' => 'nullable|date',
            'shipping_stok_item' => 'nullable|numeric',
            'shipping_stok_ea' => 'nullable|numeric',
            'shipping_penerimaan_item' => 'nullable|numeric',
            'shipping_penerimaan_ea' => 'nullable|numeric',
            'status' => 'required|string',

            // Tab 2 (POs and Invoices)
            'pos' => 'array',
            'pos.*.id' => 'nullable|exists:merchandiser_pos,id',
            'pos.*.vendor_id' => 'nullable|exists:vendors,id',
            'pos.*.supplier_name' => 'nullable|string',
            'pos.*.po_number' => 'required|string',
            'pos.*.item_count' => 'required|numeric',
            'pos.*.ea_count' => 'required|numeric',
            'pos.*.invoices' => 'array',
            'pos.*.invoices.*.id' => 'nullable|exists:merchandiser_po_invoices,id',
            'pos.*.invoices.*.invoice_number' => 'required|string',
            'pos.*.invoices.*.invoice_date' => 'required|date',
            'pos.*.invoices.*.item_count' => 'required|numeric',
            'pos.*.invoices.*.ea_count' => 'required|numeric',
            'pos.*.invoices.*.status' => 'required|string',

            'new_files' => 'nullable|array',
            'new_files.*' => 'nullable|file|max:5120',
        ]);

        $oldStatus = $merchandiser->status;

        DB::transaction(function () use ($merchandiser, $validated, $request, $auth_user) {
            $updateData = [
                'bank_name' => $validated['bank_name'],
                'account_number' => $validated['account_number'],
                'account_name' => $validated['account_name'],
                'contract_item' => $validated['contract_item'] ?? 0,
                'contract_ea' => $validated['contract_ea'] ?? 0,
                'prod_item' => $validated['shipping_produksi_item'] ?? 0,
                'prod_ea' => $validated['shipping_produksi_ea'] ?? 0,
                'prod_etd' => $validated['shipping_produksi_etd'] ?? null,
                'ship_item' => $validated['shipping_pengiriman_item'] ?? 0,
                'ship_ea' => $validated['shipping_pengiriman_ea'] ?? 0,
                'ship_etd' => $validated['shipping_pengiriman_etd'] ?? null,
                'stock_item' => $validated['shipping_stok_item'] ?? 0,
                'stock_ea' => $validated['shipping_stok_ea'] ?? 0,
                'rec_item' => $validated['shipping_penerimaan_item'] ?? 0,
                'rec_ea' => $validated['shipping_penerimaan_ea'] ?? 0,
                'status' => $validated['status'],
                'last_modifier_id' => $auth_user->id,
            ];

            if ($merchandiser->handle_id === null) {
                $updateData['handle_id'] = $auth_user->id;
            }

            $merchandiser->update($updateData);

            // Sync POs
            $keepPoIds = [];
            foreach (($validated['pos'] ?? []) as $poData) {
                $poPayload = [
                    'vendor_id' => $poData['vendor_id'],
                    'supplier_name_manual' => $poData['vendor_id'] ? null : ($poData['supplier_name'] ?? null),
                    'po_number' => $poData['po_number'],
                    'item_count' => $poData['item_count'],
                    'ea_count' => $poData['ea_count'],
                ];

                if (!empty($poData['id'])) {
                    $po = $merchandiser->pos()->findOrFail($poData['id']);
                    $po->update($poPayload);
                } else {
                    $po = $merchandiser->pos()->create($poPayload);
                }
                
                $keepPoIds[] = $po->id;

                // Sync Invoices
                $keepInvIds = [];
                foreach (($poData['invoices'] ?? []) as $invData) {
                    $invPayload = [
                        'invoice_number' => $invData['invoice_number'],
                        'invoice_date' => $invData['invoice_date'],
                        'item_count' => $invData['item_count'],
                        'ea_count' => $invData['ea_count'],
                        'status' => $invData['status'],
                    ];

                    if (!empty($invData['id'])) {
                        $inv = $po->invoices()->findOrFail($invData['id']);
                        $inv->update($invPayload);
                    } else {
                        $inv = $po->invoices()->create($invPayload);
                    }
                    
                    $keepInvIds[] = $inv->id;
                }
                $po->invoices()->whereNotIn('id', $keepInvIds)->delete();
            }
            $merchandiser->pos()->whereNotIn('id', $keepPoIds)->delete();

            // Handle file uploads
            if ($request->hasFile('new_files')) {
                foreach ($request->file('new_files') as $file) {
                    $path = $file->store('merchandiser/attachments', 'public');
                    
                    $merchandiser->files()->create([
                        'file_name' => $file->getClientOriginalName(),
                        'file_path' => $path,
                        'file_size' => $file->getSize(),
                        'mime_type' => $file->getClientMimeType(),
                    ]);
                }
            }
        });

        $this->logActivity('telah memperbarui data merchandiser', 'Merchandiser', $project->name, 'description', 'text-indigo-500');

        $project->refresh()->updateProgress();
        
        $merchandiser->refresh();
        $progress = $merchandiser->contract_ea > 0 ? min(100, (int)round(($merchandiser->rec_ea / $merchandiser->contract_ea) * 100)) : 0;
        if ($merchandiser->wasChanged() && ($progress == 100 || $oldStatus !== $merchandiser->status)) {
            \Illuminate\Support\Facades\Notification::send(\App\Models\User::where('id', '!=', auth()->id())->get(), new \App\Notifications\ModuleProgressNotification('merchandiser', $merchandiser->status, $auth_user, $project->name, $project->id, $progress));
        }

        return back()->with('success', 'Data merchandiser berhasil diperbarui!');
    }

    public function uploadFile(Request $request, $hashedId)
    {
        $id = Hashid::decode($hashedId);
        $project = Project::findOrFail($id);
        $merchandiser = Merchandiser::where('project_id', $project->id)->firstOrFail();

        // Review Mode Permission Check
        if (in_array($project->status, ['Pending', 'Completed'])) {
            return back()->with('error', 'Tidak dapat mengunggah file dalam Mode Peninjauan.');
        }

        $request->validate([
            'files.*' => 'required|file|max:5120',
        ]);

        if ($request->hasFile('files')) {
            $files = $request->file('files');
            $uploadedCount = 0;

            foreach ($files as $file) {
                $path = $file->store('merchandiser/attachments', 'public');
                
                $merchandiser->files()->create([
                    'file_name' => $file->getClientOriginalName(),
                    'file_path' => $path,
                    'file_size' => $file->getSize(),
                    'mime_type' => $file->getClientMimeType(),
                ]);
                $uploadedCount++;
            }

            $this->logActivity("telah mengunggah {$uploadedCount} lampiran file merchandiser", 'Merchandiser', $project->name, 'text_snippet', 'text-blue-500');

            return back()->with('success', "{$uploadedCount} file berhasil diunggah!");
        }

        return back()->with('error', 'Gagal mengunggah file.');
    }

    public function deleteFile(Request $request, $fileId)
    {
        $file = MerchandiserFile::findOrFail($fileId);
        $project = $file->merchandiser->project;

        // Authorization Check (PIC or Admin)
        $auth_user = $request->user();
        $isSuperAdmin = $auth_user->hasRole('Super Admin') || $auth_user->username === 'admin';
        $isPic = $auth_user->id === $project->pic_id;
        $isProjectActive = !in_array($project->status, ['Pending', 'Completed']);

        if (!($isPic || $isSuperAdmin) || !$isProjectActive) {
            $message = 'Anda tidak berwenang menghapus file ini.';
            if (!$isProjectActive) {
                $message = 'Tidak bisa menghapus file saat status Project ' . $project->status . '.';
            }
            return back()->with('error', $message);
        }
        
        if (Storage::disk('public')->exists($file->file_path)) {
            Storage::disk('public')->delete($file->file_path);
        }
        
        $file->delete();

        $this->logActivity('telah menghapus lampiran file merchandiser', 'Merchandiser', $file->file_name, 'delete', 'text-rose-500');

        return back()->with('success', 'File berhasil dihapus!');
    }
}
