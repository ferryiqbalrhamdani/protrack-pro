<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\Project;
use App\Models\ActivityLog;
use App\Models\Company;
use Inertia\Inertia;
use Carbon\Carbon;

class ReportController extends Controller
{
    public function index(Request $request)
    {
        $year = $request->query('year', 'All');
        
        $availableYears = Project::whereNotNull('contract_date')
            ->pluck('contract_date')
            ->map(function ($date) {
                return Carbon::parse($date)->year;
            })
            ->unique()
            ->sortDesc()
            ->values()
            ->toArray();

        // If no projects have contract_date, default to current year
        if (empty($availableYears)) {
            $availableYears = [Carbon::now()->year];
        }
        
        $query = Project::query();
        if ($year !== 'All') {
            $query->whereYear('contract_date', $year);
        }

        // 1. Monthly Stats (Count)
        $monthlyStats = [];
        $months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des'];
        
        $monthlyQueryBase = Project::query();
        if ($year !== 'All') {
            $monthlyQueryBase->whereYear('contract_date', $year);
        }

        foreach ($months as $i => $month) {
            $monthNum = str_pad($i + 1, 2, '0', STR_PAD_LEFT);
            $q = clone $monthlyQueryBase;
            $count = $q->whereMonth('contract_date', $monthNum)->count();
            $monthlyStats[] = ['m' => $month, 'v' => $count];
        }

        // 2. Status Stats (Count)
        $ongoingCount = (clone $query)->where('status', 'Ongoing')->count();
        $completedCount = (clone $query)->where('status', 'Completed')->count();
        $pendingCount = (clone $query)->where('status', 'Pending')->count();
        
        $total = $ongoingCount + $completedCount + $pendingCount;

        $statusStats = [
            'total' => $total,
            'ongoing' => $ongoingCount,
            'completed' => $completedCount,
            'pending' => $pendingCount
        ];

        // 3. Contract Value per Company
        $companyStatsRaw = (clone $query)->select('company_id', DB::raw('SUM(contract_value) as total_value'))
                                      ->with('company:id,name') // Ensure Company model relation is defined in Project
                                      ->groupBy('company_id')
                                      ->orderByDesc('total_value')
                                      ->get();

        $colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#6366f1', '#84cc16', '#06b6d4', '#f43f5e', '#ec4899', '#d946ef'];
        $companyContractValues = [];
        foreach ($companyStatsRaw as $index => $stat) {
            if ($stat->total_value > 0) {
                $companyContractValues[] = [
                    'name' => $stat->company ? $stat->company->name : 'Unknown',
                    'value' => (float)$stat->total_value,
                    'color' => $colors[$index % count($colors)],
                ];
            }
        }

        // 4. Sub-Module Lifecycle Statistics (Contracts, Merchandiser, Billing, Shipping)
        // Helper to get stats for a specific relation
        $getModuleStats = function($relationName) use ($query) {
            $baseQuery = clone $query;
            // Since it's a 1-to-1 we can join or query existence. Filtering by project created_at (which is the year constraint).
            // We need to count by the status of the related model.
            $ongoing = (clone $baseQuery)->whereHas($relationName, function ($q) { $q->where('status', 'Ongoing'); })->count();
            $completed = (clone $baseQuery)->whereHas($relationName, function ($q) { $q->where('status', 'Completed'); })->count();
            $pending = (clone $baseQuery)->whereHas($relationName, function ($q) { $q->where('status', 'Pending'); })->count();
            return [
                'ongoing' => $ongoing,
                'completed' => $completed,
                'pending' => $pending
            ];
        };

        $moduleStats = [
            'contract' => $getModuleStats('contract'),
            'merchandiser' => $getModuleStats('merchandiser'),
            'billing' => $getModuleStats('billing'),
            'shipping' => $getModuleStats('shipping'),
        ];

        // 5. Due Projects (Ongoing/Pending)
        $dueQuery = Project::whereIn('status', ['Ongoing', 'Pending']);
        if ($year !== 'All') {
            $dueQuery->whereYear('due_date', $year);
        }

        $dueProjectsRaw = $dueQuery->orderBy('due_date', 'asc')
                                   ->get(['id', 'name', 'contract_no', 'progress', 'due_date']);

        $dueProjects = $dueProjectsRaw->map(function ($project) {
            return [
                'id' => $project->id,
                'name' => $project->name,
                'contract_no' => $project->contract_no ?: 'Belum Ada Kontrak',
                'progress' => $project->progress,
                'due_date' => $project->due_date ? Carbon::parse($project->due_date)->format('d M Y') : 'No Date'
            ];
        });

        // Retrieve the most recent projects mapped with each of their individual module status
        $getModuleTableData = function($relationName) use ($query) {
            $baseQuery = clone $query;
            $moduleRecords = $baseQuery->has($relationName)
                                       ->with(['company:id,name', 'pic:id,name', $relationName . '.handle:id,name'])
                                       ->orderBy('created_at', 'desc') // Change sort if needed
                                       ->get();

            return $moduleRecords->map(function ($proj) use ($relationName) {
                $moduleInstance = $proj->$relationName;
                return [
                    'id' => $proj->id,
                    'proj' => $proj->name,
                    'client' => $proj->company ? $proj->company->name : '-',
                    'no' => $proj->contract_no ?: '-',
                    'up' => $proj->up_no,
                    'pic' => $proj->pic ? $proj->pic->name : '-',
                    'handle' => ($moduleInstance && $moduleInstance->handle) 
                                ? $moduleInstance->handle->name 
                                : '-',
                    // Extracting module specific data
                    'prog' => $moduleInstance ? $moduleInstance->progress : 0,
                    'status' => $moduleInstance ? $moduleInstance->status : 'Pending', // Fallback
                    // You might adjust these dates depending on the exact design intent vs schema
                    'date' => $proj->created_at->format('d M Y'),
                    'due' => $proj->due_date ? Carbon::parse($proj->due_date)->format('d M Y') : '-',
                ];
            });
        };

        $moduleData = [
            'contract' => $getModuleTableData('contract'),
            'merchandiser' => $getModuleTableData('merchandiser'),
            'billing' => $getModuleTableData('billing'),
            'shipping' => $getModuleTableData('shipping'),
        ];
        
        $activityLogQuery = ActivityLog::with('user');
        if ($year !== 'All') {
            $activityLogQuery->whereYear('created_at', $year);
        }

        $activityLogs = (clone $activityLogQuery)->latest()->paginate(10)->withQueryString();
        $recentActivities = (clone $activityLogQuery)->latest()->take(5)->get();
        
        // 6. Financial Stats (Top Widgets)
        $projectsForFinance = (clone $query)->with('billing.items')->get(['id', 'contract_value', 'payment_term', 'status']);
        $totalNilaiProyek = 0;
        $akumulasiDp = 0;
        $tagihanTermin = 0;
        $pembayaranLangsung = 0;

        foreach ($projectsForFinance as $p) {
            $totalNilaiProyek += $p->contract_value;
            
            if (str_starts_with($p->payment_term, 'DP')) {
                // DP: Calculate expected DP value directly from the contract value
                $dpPct = 0.3; // Default 30% if no percentage is specified
                if (preg_match('/DP\s+(\d+)%/', $p->payment_term, $matches)) {
                    $dpPct = ((float)$matches[1]) / 100;
                }
                $akumulasiDp += $p->contract_value * $dpPct;
            } elseif ($p->payment_term === 'Termin Berjangka') {
                // Termin: Accumulate total contract value for all projects with "Termin Berjangka"
                $tagihanTermin += $p->contract_value;
            } elseif ($p->payment_term === 'Tidak ada DP') {
                // Akumulasi Pembayaran Langsung: total contract value for all projects with "Tidak ada DP"
                $pembayaranLangsung += $p->contract_value;
            }
        }

        $financialStats = [
            'total_nilai' => $totalNilaiProyek,
            'akumulasi_dp' => $akumulasiDp,
            'pembayaran_langsung' => $pembayaranLangsung,
            'tagihan_termin' => $tagihanTermin,
        ];

        return Inertia::render('Reports/Index', [
            'queryParams' => $request->query(),
            'monthlyStats' => $monthlyStats,
            'statusStats' => $statusStats,
            'companyContractValues' => $companyContractValues,
            'moduleStats' => $moduleStats,
            'moduleData' => $moduleData,
            'dueProjects' => collect($dueProjects),
            'financialStats' => $financialStats,
            'recentActivities' => $recentActivities,
            'activityLogs' => $activityLogs,
            'availableYears' => $availableYears,
        ]);
    }

    public function projectReport(Request $request)
    {
        $year = $request->query('year', 'All');
        $search = $request->query('search');
        $status = $request->query('status', 'All');
        $company = $request->query('company', 'All');
        $startDate = $request->query('start_date');
        $endDate = $request->query('end_date');

        $query = Project::with(['company', 'contract.handle', 'pic', 'merchandiser', 'billing', 'shipping'])
            ->orderBy('created_at', 'desc');

        if ($year !== 'All') {
            $query->whereYear('contract_date', $year);
        }

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('contract_no', 'like', "%{$search}%")
                  ->orWhereHas('company', function ($c) use ($search) {
                      $c->where('name', 'like', "%{$search}%");
                  });
            });
        }

        if ($status !== 'All') {
            $query->where('status', $status);
        }

        if ($company !== 'All') {
            $query->where('company_id', $company);
        }

        if ($startDate) {
            $query->whereDate('contract_date', '>=', $startDate);
        }
        
        if ($endDate) {
            $query->whereDate('contract_date', '<=', $endDate);
        }

        $projects = $query->paginate(10)->withQueryString()->through(function ($project) {
            // Map color based on status
            $color = 'blue';
            if ($project->status === 'Completed') $color = 'emerald';
            elseif ($project->status === 'Pending') $color = 'amber';

            return [
                'id' => $project->id,
                'hashed_id' => \App\Support\Hashid::encode($project->id),
                'proj' => $project->name,
                'client' => $project->company->name ?? 'Unknown',
                'no' => $project->contract_no ?? 'Belum ada Kontrak',
                'up' => $project->up_no ?? '-',
                'pic' => $project->contract?->handle?->name ?? $project->pic?->name ?? '-',
                'date' => $project->created_at->format('d M Y'),
                'due' => $project->due_date ? Carbon::parse($project->due_date)->format('d M Y') : '-',
                'prog' => $project->progress,
                'status' => $project->status,
                'c' => $color,
            ];
        });

        // Get full company list that have projects for the filter dropdown
        $companies = Company::whereHas('projects')
            ->select('id', 'name')
            ->orderBy('name')
            ->get()
            ->map(fn($c) => ['label' => $c->name, 'value' => (string)$c->id]);

        return Inertia::render('Reports/ProjectReport', [
            'projects' => $projects,
            'companies' => $companies,
            'queryParams' => $request->query(),
        ]);
    }

    public function projectDetail($hashedId)
    {
        $formattedProject = $this->getFormattedProjectDetail($hashedId);

        return Inertia::render('Reports/ProjectDetail', [
            'project' => $formattedProject
        ]);
    }

    public function projectPrint($hashedId)
    {
        $formattedProject = $this->getFormattedProjectDetail($hashedId);

        return Inertia::render('Reports/ProjectPrint', [
            'project' => $formattedProject
        ]);
    }

    private function getFormattedProjectDetail($hashedId)
    {
        $project = Project::with([
            'auctionType', 'agency', 'company', 'budgetType', 'pic', 'brandOrigin',
            'vendors', 'certifications', 'installments',
            'contract.handle', 'contract.steps', 'contract.attachments',
            'merchandiser.handle', 'merchandiser.pos.invoices', 'merchandiser.pos.vendor', 'merchandiser.files',
            'billing.handle', 'billing.basts', 'billing.items', 'billing.files',
            'shipping.handle', 'shipping.documents', 'shipping.files'
        ])->findOrFail(\App\Support\Hashid::decode($hashedId) ?? 0);

        // Format installments
        $formattedInstallments = $project->installments->map(function ($inst, $key) use ($project) {
            return [
                'id' => $key + 1,
                'name' => $inst->name,
                'percentage' => $inst->percentage,
                // If it's saved as nominal, use it, else calculate from percentage
                'value' => 'Rp ' . number_format($inst->nominal_value ?: ($project->contract_value * ($inst->percentage / 100)), 0, ',', '.')
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

        $formattedProject = [
            'id' => $hashedId,
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
                    'pos' => $project->merchandiser?->pos?->map(function($po) {
                        return [
                            'id' => $po->id,
                            'po_number' => $po->po_number,
                            'vendor_name' => $po->vendor ? $po->vendor->name : $po->supplier_name_manual,
                            'items' => $po->item_count,
                            'ea' => $po->ea_count,
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

        return $formattedProject;
    }
}
