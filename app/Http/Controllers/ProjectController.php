<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Models\Project;
use App\Models\Agency;
use App\Models\Company;
use App\Models\AuctionType;
use App\Models\BudgetType;
use App\Models\Vendor;
use App\Models\User;
use App\Models\BrandOrigin;
use App\Models\Certification;
use App\Models\Contract;
use App\Models\Merchandiser;
use App\Models\Billing;
use App\Models\Shipping;
use App\Models\ProjectInstallment;
use App\Traits\HandlesActivityLog;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Illuminate\Support\Facades\Notification;
use App\Notifications\ProjectUpdatedNotification;
use Carbon\Carbon;
use App\Support\Hashid;

class ProjectController extends Controller
{
    use HandlesActivityLog;

    public function index(Request $request)
    {
        $query = Project::with(['auctionType', 'agency', 'company', 'pic']);

        if ($request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', '%' . $request->search . '%')
                  ->orWhere('up_no', 'like', '%' . $request->search . '%');
            });
        }

        if ($request->status && $request->status !== 'All') {
            $query->where('status', $request->status);
        }

        if ($request->company && $request->company !== 'All') {
            $query->where('company_id', $request->company);
        }

        if ($request->start_date) {
            $query->whereDate('due_date', '>=', $request->start_date);
        }

        if ($request->end_date) {
            $query->whereDate('due_date', '<=', $request->end_date);
        }

        // Sorting
        $sort_by = $request->sort_by ?? 'created_at';
        $sort_dir = $request->sort_dir ?? 'desc';
        $allowed_sorts = ['name', 'progress', 'status', 'contract_value', 'contract_date', 'created_at'];
        
        if (in_array($sort_by, $allowed_sorts)) {
            $query->orderBy($sort_by, $sort_dir);
        } else {
            $query->latest();
        }

        $projects = $query->paginate(10)->withQueryString();

        $projects->getCollection()->transform(function ($project) {
            $project->hashed_id = Hashid::encode($project->id);
            return $project;
        });

        return Inertia::render('Project/Index', [
            'projects' => $projects,
            'filters' => $request->only(['search', 'status', 'company', 'start_date', 'end_date', 'sort_by', 'sort_dir'])
        ]);
    }

    public function create()
    {
        return Inertia::render('Project/Create', [
            'options' => [
                'auctionType' => AuctionType::where('status', 'Active')->get(['id', 'name']),
                'institution' => Agency::where('status', 'Active')->get(['id', 'name']),
                'company' => Company::where('status', 'Active')->get(['id', 'name']),
                'budgetType' => BudgetType::where('status', 'Active')->get(['id', 'name']),
                'users' => User::get(['id', 'name']),
                'vendors' => Vendor::where('status', 'Active')->get(['id', 'name']),
                'brandOrigins' => BrandOrigin::with('certifications')->get(),
            ]
        ]);
    }

    public function store(Request $request)
    {
        if ($request->has('up_no')) {
            $request->merge(['up_no' => strtoupper($request->up_no)]);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'up_no' => 'required|string|unique:projects,up_no',
            'auction_type_id' => 'required|exists:auction_types,id',
            'agency_id' => 'required|exists:agencies,id',
            'company_id' => 'required|exists:companies,id',
            'budget_type_id' => 'required|exists:budget_types,id',
            'pic_id' => 'required|exists:users,id',
            'budget_year' => 'required',
            'description' => 'nullable|string',
            
            'tax_free' => 'required|in:Iya,Tidak',
            'tax_doc' => 'nullable|required_if:tax_free,Iya|in:SKTD,SKB',
            'brand_origin_id' => 'required|exists:brand_origins,id',
            'payment_term' => 'nullable|string',
            'warranty' => 'nullable|string',
            
            'contract_no' => 'nullable|string',
            'contract_value' => 'required|numeric',
            'contract_date' => 'nullable|date',
            'due_date' => 'nullable|date',
            
            'vendor_ids' => 'required|array',
            'vendor_ids.*' => 'exists:vendors,id',
            'certification_ids' => 'nullable|array',
            'certification_ids.*' => 'exists:certifications,id',
            
            'installments' => 'nullable|array',
            'installments.*.name' => 'required|string',
            'installments.*.percentage' => 'required|numeric',
            'installments.*.value' => 'required|numeric',
        ]);

        return DB::transaction(function () use ($validated, $request) {
            $project = Project::create([
                'name' => $validated['name'],
                'up_no' => $validated['up_no'],
                'auction_type_id' => $validated['auction_type_id'],
                'agency_id' => $validated['agency_id'],
                'company_id' => $validated['company_id'],
                'budget_type_id' => $validated['budget_type_id'],
                'pic_id' => $validated['pic_id'],
                'budget_year' => $validated['budget_year'],
                'description' => $validated['description'],
                'tax_free' => $validated['tax_free'],
                'tax_doc' => $validated['tax_doc'],
                'brand_origin_id' => $validated['brand_origin_id'],
                'payment_term' => $validated['payment_term'],
                'warranty' => $validated['warranty'],
                'contract_no' => $validated['contract_no'],
                'contract_value' => $validated['contract_value'],
                'contract_date' => $validated['contract_date'],
                'due_date' => $validated['due_date'],
            ]);

            $project->vendors()->attach($validated['vendor_ids']);
            
            if (!empty($validated['certification_ids'])) {
                $project->certifications()->attach($validated['certification_ids']);
            }

            if (!empty($validated['installments'])) {
                foreach ($validated['installments'] as $inst) {
                    $project->installments()->create($inst);
                }
            }

            // Automation: Create related records
            Contract::create(['project_id' => $project->id, 'status' => 'Ongoing']);
            Merchandiser::create(['project_id' => $project->id, 'status' => 'Ongoing']);
            Billing::create(['project_id' => $project->id, 'status' => 'Ongoing']);
            Shipping::create(['project_id' => $project->id, 'status' => 'Ongoing']);

            $this->logActivity('telah membuat proyek baru', 'Proyek', $project->name, 'business_center', 'text-blue-500');

            /** @var User $authUser */
            $authUser = auth()->user();
            $recipients = User::where('id', '!=', $authUser->id)->get();
            Notification::send($recipients, new ProjectUpdatedNotification($project, $authUser, 'created'));

            return redirect()->route('projects')->with('success', 'Project created successfully!');
        });
    }

    public function edit(Project $project)
    {
        $project->load(['vendors', 'certifications', 'installments']);
        
        return Inertia::render('Project/Edit', [
            'project' => $project,
            'options' => [
                'auctionType' => AuctionType::where('status', 'Active')->get(['id', 'name']),
                'institution' => Agency::where('status', 'Active')->get(['id', 'name']),
                'company' => Company::where('status', 'Active')->get(['id', 'name']),
                'budgetType' => BudgetType::where('status', 'Active')->get(['id', 'name']),
                'users' => User::get(['id', 'name']),
                'vendors' => Vendor::where('status', 'Active')->get(['id', 'name']),
                'brandOrigins' => BrandOrigin::with('certifications')->get(),
            ]
        ]);
    }

    public function update(Request $request, Project $project)
    {
        if ($request->has('up_no')) {
            $request->merge(['up_no' => strtoupper($request->up_no)]);
        }
        
        $validated = $request->validate([
            'status' => 'required|in:Ongoing,Pending,Completed',
            'name' => 'required|string|max:255',
            'up_no' => 'required|string|unique:projects,up_no,' . $project->id,
            'auction_type_id' => 'required|exists:auction_types,id',
            'agency_id' => 'required|exists:agencies,id',
            'company_id' => 'required|exists:companies,id',
            'budget_type_id' => 'required|exists:budget_types,id',
            'pic_id' => 'required|exists:users,id',
            'budget_year' => 'required',
            'description' => 'nullable|string',
            
            'tax_free' => 'required|in:Iya,Tidak',
            'tax_doc' => 'nullable|required_if:tax_free,Iya|in:SKTD,SKB',
            'brand_origin_id' => 'required|exists:brand_origins,id',
            'payment_term' => 'nullable|string',
            'warranty' => 'nullable|string',
            
            'contract_no' => 'nullable|string',
            'contract_value' => 'required|numeric',
            'contract_date' => 'nullable|date',
            'due_date' => 'nullable|date',
            
            'vendor_ids' => 'required|array',
            'vendor_ids.*' => 'exists:vendors,id',
            'certification_ids' => 'nullable|array',
            'certification_ids.*' => 'exists:certifications,id',
            
            'installments' => 'nullable|array',
            'installments.*.name' => 'required|string',
            'installments.*.percentage' => 'required|numeric',
            'installments.*.value' => 'required|numeric',
        ]);

        return DB::transaction(function () use ($validated, $project) {
            $oldStatus = $project->status;

            $project->update([
                'status' => $validated['status'],
                'name' => $validated['name'],
                'up_no' => $validated['up_no'],
                'auction_type_id' => $validated['auction_type_id'],
                'agency_id' => $validated['agency_id'],
                'company_id' => $validated['company_id'],
                'budget_type_id' => $validated['budget_type_id'],
                'pic_id' => $validated['pic_id'],
                'budget_year' => $validated['budget_year'],
                'description' => $validated['description'],
                'tax_free' => $validated['tax_free'],
                'tax_doc' => $validated['tax_doc'],
                'brand_origin_id' => $validated['brand_origin_id'],
                'payment_term' => $validated['payment_term'],
                'warranty' => $validated['warranty'],
                'contract_no' => $validated['contract_no'],
                'contract_value' => $validated['contract_value'],
                'contract_date' => $validated['contract_date'],
                'due_date' => $validated['due_date'],
            ]);

            $project->vendors()->sync($validated['vendor_ids']);
            $project->certifications()->sync($validated['certification_ids'] ?? []);
            
            // Handle installments: simpler to delete and recreate for complex nested data in sync
            $project->installments()->delete();
            if (!empty($validated['installments'])) {
                foreach ($validated['installments'] as $inst) {
                    $project->installments()->create($inst);
                }
            }

            // Only send notification if something actually changed
            if ($project->wasChanged()) {
                $this->logActivity('telah memperbarui data proyek', 'Proyek', $project->name, 'edit', 'text-amber-500');

                $statusChanged = $oldStatus !== $project->status;
                $actionType = $statusChanged ? 'status_changed' : 'updated';

                /** @var User $authUser */
                $authUser = auth()->user();
                $recipients = User::where('id', '!=', $authUser->id)->get();
                Notification::send($recipients, new ProjectUpdatedNotification($project, $authUser, $actionType));
            }

            return redirect()->route('projects')->with('success', 'Project updated successfully!');
        });
    }

    public function destroy(Project $project)
    {
        try {
            DB::transaction(function () use ($project) {
                // Delete related records via relationships if not using cascade on delete
                // Pivot tables
                $project->vendors()->detach();
                $project->certifications()->detach();
                
                // HasMany/HasOne relations
                $project->installments()->delete();
                $project->contract()->delete();
                $project->merchandiser()->delete();
                $project->billing()->delete();
                $project->shipping()->delete();

                $project->delete();
            });

            $this->logActivity('telah menghapus proyek', 'Proyek', $project->name, 'delete', 'text-rose-500');

            /** @var User $authUser */
            $authUser = auth()->user();
            $recipients = User::where('id', '!=', $authUser->id)->get();
            Notification::send($recipients, new ProjectUpdatedNotification($project, $authUser, 'deleted'));

            return redirect()->route('projects')->with('success', 'Proyek berhasil dihapus.');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Gagal menghapus proyek: ' . $e->getMessage());
        }
    }

    public function show($hashedId)
    {
        $id = Hashid::decode($hashedId);
        $project = Project::findOrFail($id);
        $hashedId = Hashid::encode($project->id);
        $formattedProject = $this->getFormattedProject($project, $hashedId);

        return Inertia::render('Project/Show', [
            'project' => $formattedProject
        ]);
    }

    private function getFormattedProject($project, $hashedId)
    {
        $project->load([
            'auctionType', 'agency', 'company', 'budgetType', 'pic', 'brandOrigin',
            'vendors', 'certifications', 'installments',
            'contract.handle', 'contract.steps', 'contract.attachments',
            'merchandiser.handle', 'merchandiser.pos.invoices', 'merchandiser.pos.vendor', 'merchandiser.files',
            'billing.handle', 'billing.basts', 'billing.items', 'billing.files',
            'shipping.handle', 'shipping.documents', 'shipping.files'
        ]);

        // Format installments
        $formattedInstallments = $project->installments->map(function ($inst, $key) use ($project) {
            return [
                'id' => $key + 1,
                'name' => $inst->name,
                'percentage' => $inst->percentage,
                'value' => 'Rp ' . number_format($inst->value ?: ($project->contract_value * ($inst->percentage / 100)), 0, ',', '.')
            ];
        });

        // Format contract stages
        $contractStages = collect();
        if ($project->contract) {
            $contractStages = $project->contract->steps->map(function ($step, $key) {
                return [
                    'id' => $key + 1,
                    'name' => $step->name,
                    'completed' => (bool) $step->completed
                ];
            });
        }

        // Format billing basts
        $billingBasts = collect();
        if ($project->billing) {
            $billingBasts = $project->billing->basts->map(function ($bast, $key) {
                return [
                    'id' => $key + 1,
                    'no' => $bast->no_bast,
                    'date' => $bast->tgl_bast ? Carbon::parse($bast->tgl_bast)->format('d M Y') : '-'
                ];
            });
        }

        // Format billing items
        $billingStages = collect();
        if ($project->billing) {
            $billingStages = $project->billing->items->map(function ($item, $key) {
                return [
                    'id' => $key + 1,
                    'name' => $item->name,
                    'type' => $item->type,
                    'completed' => (bool) $item->completed
                ];
            });
        }

        // Format shipping documents
        $baAnnames = collect();
        $baInnames = collect();
        if ($project->shipping) {
            $baAnnames = $project->shipping->documents->where('type', 'anname')->values()->map(function ($doc, $key) {
                return [
                    'id' => $key + 1,
                    'no' => $doc->doc_no,
                    'date' => $doc->doc_date ? Carbon::parse($doc->doc_date)->format('d M Y') : '-'
                ];
            });
            $baInnames = $project->shipping->documents->where('type', 'inname')->values()->map(function ($doc, $key) {
                return [
                    'id' => $key + 1,
                    'no' => $doc->doc_no,
                    'date' => $doc->doc_date ? Carbon::parse($doc->doc_date)->format('d M Y') : '-'
                ];
            });
        }
        
        $valueStr = 'Rp ' . number_format($project->contract_value, 0, ',', '.');

        return [
            'id' => $hashedId,
            'real_id' => $project->id,
            'name' => $project->name,
            'proj' => $project->name,
            'up' => $project->up_no ?? '-',
            'auctionType' => $project->auctionType->name ?? '-',
            'institution' => $project->agency->name ?? '-',
            'company' => $project->company->name ?? '-',
            'budgetType' => $project->budgetType->name ?? '-',
            'pic' => $project->pic->name ?? '-',
            'budgetYear' => $project->budget_year ?? '-',
            'vendors' => $project->vendors->pluck('name'),
            'description' => $project->description,
            'taxFree' => $project->tax_free,
            'taxDoc' => $project->tax_doc ?? '-',
            'brandOrigin' => $project->brandOrigin->name ?? '-',
            'certificates' => $project->certifications->pluck('name'),
            'paymentTerm' => $project->payment_term,
            'warranty' => $project->warranty,
            'contractNo' => $project->contract_no ?? '-',
            'value' => $valueStr,
            'contractDate' => $project->contract_date ? Carbon::parse($project->contract_date)->format('d M Y') : '-',
            'dueDate' => $project->due_date ? Carbon::parse($project->due_date)->format('d M Y') : '-',
            'progress' => $project->progress,
            'status' => $project->status,
            'installments' => $formattedInstallments,

            'relations' => [
                'contract' => [
                    'userHandle' => $project->contract->handle->name ?? '-',
                    'jamlak' => $project->contract->jamlak ?? '-',
                    'jamlakValue' => $project->contract->jamlak_nominal ?? 0,
                    'jamuk' => $project->contract->jamuka ?? '-',
                    'jamukValue' => $project->contract->jamuka_nominal ?? 0,
                    'jamwar' => $project->contract->jamwar ?? '-',
                    'jamwarValue' => $project->contract->jamwar_nominal ?? 0,
                    'stages' => $contractStages,
                    'files' => $project->contract?->attachments?->map(function($f) {
                        return ['name' => $f->file_name, 'url' => asset('storage/' . $f->file_path)];
                    }) ?? [],
                    'progress' => $project->contract->progress ?? 0,
                    'status' => $project->contract->status ?? 'Pending'
                ],
                'merchandiser' => [
                    'userPIC' => $project->pic->name ?? '-',
                    'paymentName' => $project->merchandiser->account_name ?? '-',
                    'paymentBank' => $project->merchandiser->bank_name ?? '-',
                    'paymentAccount' => $project->merchandiser->account_number ?? '-',
                    'contractItems' => $project->merchandiser->contract_item ?? 0,
                    'contractEA' => $project->merchandiser->contract_ea ?? 0,
                    'receivedItems' => $project->merchandiser->rec_item ?? 0,
                    'receivedEA' => $project->merchandiser->rec_ea ?? 0,
                    'totalPOValue' => (float) ($project->merchandiser?->pos?->sum('po_value') ?? 0),
                    'totalPOCount' => (int) ($project->merchandiser?->pos?->count() ?? 0),
                    'pos' => $project->merchandiser?->pos?->map(function($po) {
                        return [
                            'id' => $po->id,
                            'no' => $po->po_number,
                            'vendor' => $po->vendor?->name ?? $po->supplier_name_manual,
                            'items' => $po->item_count,
                            'ea' => $po->ea_count,
                            'value' => (float) $po->po_value,
                            'invoices' => $po->invoices->map(function($inv) {
                                return [
                                    'id' => $inv->id,
                                    'invoice_number' => $inv->invoice_number,
                                    'date' => \Carbon\Carbon::parse($inv->invoice_date)->format('d M Y'),
                                    'status' => $inv->status
                                ];
                            })
                        ];
                    }) ?? [],
                    'files' => $project->merchandiser?->files?->map(function($f) {
                        return ['name' => $f->file_name, 'url' => asset('storage/' . $f->file_path)];
                    }) ?? [],
                    'progress' => $project->merchandiser->progress ?? 0,
                    'status' => $project->merchandiser->status ?? 'Pending'
                ],
                'billing' => [
                    'userHandle' => $project->billing->handle->name ?? '-',
                    'basts' => $billingBasts,
                    'stages' => $billingStages,
                    'files' => $project->billing?->files?->map(function($f) {
                        return ['name' => $f->file_name, 'url' => asset('storage/' . $f->file_path)];
                    }) ?? [],
                    'progress' => $project->billing->progress ?? 0,
                    'status' => $project->billing->status ?? 'Pending'
                ],
                'shipping' => [
                    'userHandle' => $project->shipping->handle->name ?? '-',
                    'type' => ($project->shipping && $project->shipping->shipping_type === 'Lengkap' && empty($project->shipping->shipping_date) && empty($project->shipping->handle_id)) ? '-' : ($project->shipping->shipping_type ?? '-'),
                    'date' => $project->shipping->shipping_date ? Carbon::parse($project->shipping->shipping_date)->format('d M Y') : '-',
                    'baAnnames' => $baAnnames,
                    'baInnames' => $baInnames,
                    'files' => $project->shipping?->files?->map(function($f) {
                        return ['name' => $f->file_name, 'url' => asset('storage/' . $f->file_path)];
                    }) ?? [],
                    'progress' => $project->shipping->progress ?? 0,
                    'status' => $project->shipping->status ?? 'Pending'
                ]
            ]
        ];
    }
}
