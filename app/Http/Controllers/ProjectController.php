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
}
