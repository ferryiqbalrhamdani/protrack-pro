<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use App\Models\Project;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $timeframe = $request->query('timeframe', 'month');
        $selectedYear = $request->query('year', 'All');
        $now = Carbon::now();

        // 1. Activity Logs (Timeframe based)
        $logQuery = ActivityLog::with('user');
        switch ($timeframe) {
            case 'day':
                $logQuery->whereBetween('created_at', [$now->copy()->startOfDay(), $now->copy()->endOfDay()]);
                break;
            case 'week':
                $logQuery->where('created_at', '>=', $now->copy()->subWeek());
                break;
            case 'year':
                $logQuery->where('created_at', '>=', $now->copy()->subYear());
                break;
            case 'month':
            default:
                $logQuery->where('created_at', '>=', $now->copy()->subMonth());
                break;
        }

        $activityLogs = $logQuery->latest()->paginate(10)->withQueryString();
        $recentActivities = (clone $logQuery)->latest()->take(5)->get();

        // 2. Available Years for Filter
        $availableYears = Project::whereNotNull('budget_year')
            ->distinct()
            ->orderBy('budget_year', 'desc')
            ->pluck('budget_year')
            ->toArray();

        // 3. Unified Project Base Query (Strict Budget Year)
        $baseQuery = Project::query();
        if ($selectedYear !== 'All') {
            $baseQuery->where('budget_year', (int)$selectedYear);
        }

        // --- Metrics Calculation ---
        $endDateLastMonth = Carbon::now()->subMonth()->endOfMonth();

        // 1. Total Projects (ALL)
        $totalProjects = (clone $baseQuery)->count();
        $totalProjectsLastMonth = (clone $baseQuery)->where('created_at', '<=', $endDateLastMonth)->count();
        $totalProjectsGrowth = $totalProjectsLastMonth > 0 ? round((($totalProjects - $totalProjectsLastMonth) / $totalProjectsLastMonth) * 100) : ($totalProjects > 0 ? 100 : 0);

        // 2. Active Projects (Ongoing ONLY)
        $activeProjects = (clone $baseQuery)->where('status', 'Ongoing')->count();
        $activeLastMonth = (clone $baseQuery)->where('status', 'Ongoing')
                                            ->where('created_at', '<=', $endDateLastMonth)
                                            ->count();
        $activeGrowth = $activeLastMonth > 0 ? round((($activeProjects - $activeLastMonth) / $activeLastMonth) * 100) : ($activeProjects > 0 ? 100 : 0);

        // 3. Completed Projects
        $completedProjects = (clone $baseQuery)->where('status', 'Completed')->count();
        $completedLastMonth = (clone $baseQuery)->where('status', 'Completed')
                                               ->where('created_at', '<=', $endDateLastMonth)
                                               ->count();
        $completedGrowth = $completedLastMonth > 0 ? round((($completedProjects - $completedLastMonth) / $completedLastMonth) * 100) : ($completedProjects > 0 ? 100 : 0);

        // Billing Metrics
        $totalBilling = (clone $baseQuery)->sum('contract_value'); // Total contract value volume for selected year
        $completedBilling = (clone $baseQuery)->where('status', 'Completed')->sum('contract_value');
        $billingLastMonth = (clone $baseQuery)->where('created_at', '<=', $endDateLastMonth)->sum('contract_value');
        
        $totalBillingGrowth = $billingLastMonth > 0 ? round((($totalBilling - $billingLastMonth) / $billingLastMonth) * 100) : ($totalBilling > 0 ? 100 : 0);
        $completedBillingPercentage = $totalBilling > 0 ? round(($completedBilling / $totalBilling) * 100) : 0;

        // --- Lists Generation ---

        // Due Projects
        $dueProjects = (clone $baseQuery)->whereIn('status', ['Ongoing', 'Pending'])
            ->whereNotNull('due_date')
            ->orderBy('due_date', 'asc')
            ->take(8)
            ->get()
            ->map(function($project) {
                $dueDate = Carbon::parse($project->due_date);
                $daysLeft = Carbon::now()->diffInDays($dueDate, false);
                $status = 'Safe';
                if ($daysLeft < 7) $status = 'Urgent';
                else if ($daysLeft < 30) $status = 'Near Due';
                return [
                    'name' => $project->name,
                    'contract_no' => $project->contract_no,
                    'up_no' => $project->up_no,
                    'due' => $project->due_date,
                    'status' => $status,
                ];
            });

        // Recent Projects (Showing all in the filtered year)
        $recentProjectsList = (clone $baseQuery)->with(['pic', 'company'])
            ->latest('updated_at')
            ->take(6)
            ->get()
            ->map(function($project) {
                return [
                    'id' => $project->up_no,
                    'name' => $project->name,
                    'contract_no' => $project->contract_no,
                    'client' => $project->company?->name,
                    'pic' => $project->pic?->name,
                    'contractDate' => $project->contract_date,
                    'dueDate' => $project->due_date,
                    'progress' => $project->progress ?? 0,
                    'status' => $project->status,
                ];
            });

        // Full Export List (Excel)
        $allProjectsForExport = (clone $baseQuery)->with(['pic', 'company'])
            ->orderBy('up_no', 'desc')
            ->get()
            ->map(function($p) {
                return [
                    'UP No' => $p->up_no,
                    'Name' => $p->name,
                    'Contract No' => $p->contract_no,
                    'Client' => $p->company?->name,
                    'PIC' => $p->pic?->name,
                    'Year' => $p->budget_year,
                    'Value' => (double) $p->contract_value,
                    'Date' => $p->contract_date,
                    'Due' => $p->due_date,
                    'Progress' => $p->progress . '%',
                    'Status' => $p->status
                ];
            })->toArray();

        // 4. Trend Chart Logic
        $months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
        $chartPoints = collect($months)->map(function ($month, $index) use ($selectedYear) {
            $monthNum = $index + 1;
            $subQuery = Project::query();
            if ($selectedYear !== 'All') {
                $subQuery->where('budget_year', $selectedYear);
            } else {
                $subQuery->whereYear('updated_at', Carbon::now()->year);
            }
            $avgProgress = $subQuery->whereMonth('updated_at', $monthNum)->avg('progress') ?? 0;
            return [
                'month' => $month,
                'val' => (int) round($avgProgress)
            ];
        })->toArray();

        return Inertia::render('Dashboard', [
            'queryParams' => (object)$request->query(),
            'availableYears' => $availableYears,
            'activityLogs' => $activityLogs,
            'recentActivities' => $recentActivities,
            'dueProjects' => $dueProjects,
            'recentProjectsList' => $recentProjectsList,
            'allProjectsForExport' => $allProjectsForExport,
            'chartPoints' => $chartPoints,
            'metrics' => [
                'totalBilling' => $totalBilling,
                'totalBillingGrowth' => $totalBillingGrowth,
                'completedBillingPercentage' => $completedBillingPercentage,
                'totalProjects' => $totalProjects,
                'totalProjectsGrowth' => $totalProjectsGrowth,
                'activeProjects' => $activeProjects,
                'activeGrowth' => $activeGrowth,
                'completedProjects' => $completedProjects,
                'completedGrowth' => $completedGrowth,
            ],
        ]);
    }
}
