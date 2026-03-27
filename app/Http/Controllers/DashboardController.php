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
        $now = Carbon::now();

        $query = ActivityLog::with('user');

        switch ($timeframe) {
            case 'day':
                $query->whereBetween('created_at', [$now->copy()->startOfDay(), $now->copy()->endOfDay()]);
                break;
            case 'week':
                $query->where('created_at', '>=', $now->copy()->subWeek());
                break;
            case 'year':
                $query->where('created_at', '>=', $now->copy()->subYear());
                break;
            case 'month':
            default:
                $query->where('created_at', '>=', $now->copy()->subMonth());
                break;
        }

        $activityLogs = $query->latest()->paginate(10)->withQueryString();
        $recentActivities = $query->latest()->take(5)->get();

        // Real Metrics
        $startDateThisMonth = Carbon::now()->startOfMonth();
        $startDateLastMonth = Carbon::now()->subMonth()->startOfMonth();
        $endDateLastMonth = Carbon::now()->subMonth()->endOfMonth();

        // 1. Total Active Projects (Ongoing & Pending)
        $activeProjects = Project::whereIn('status', ['Ongoing', 'Pending'])->count();
        $activeProjectsLastMonth = Project::whereIn('status', ['Ongoing', 'Pending'])
                                          ->where('created_at', '<=', $endDateLastMonth)
                                          ->count();
        $activeGrowth = $activeProjectsLastMonth > 0 
                        ? round((($activeProjects - $activeProjectsLastMonth) / $activeProjectsLastMonth) * 100) 
                        : ($activeProjects > 0 ? 100 : 0);

        // 2. Ongoing Projects
        $ongoingProjects = Project::where('status', 'Ongoing')->count();
        $ongoingProjectsLastMonth = Project::where('status', 'Ongoing')
                                           ->where('created_at', '<=', $endDateLastMonth)
                                           ->count();
        $ongoingGrowth = $ongoingProjectsLastMonth > 0 
                         ? round((($ongoingProjects - $ongoingProjectsLastMonth) / $ongoingProjectsLastMonth) * 100) 
                         : ($ongoingProjects > 0 ? 100 : 0);

        // 3. Completed Projects
        $completedProjects = Project::where('status', 'Completed')->count();
        $completedProjectsLastMonth = Project::where('status', 'Completed')
                                             ->where('created_at', '<=', $endDateLastMonth)
                                             ->count();
        $completedGrowth = $completedProjectsLastMonth > 0 
                           ? round((($completedProjects - $completedProjectsLastMonth) / $completedProjectsLastMonth) * 100) 
                           : ($completedProjects > 0 ? 100 : 0);

        // Calculate total billing (Accumulation of all project contract values)
        $totalBilling = Project::sum('contract_value');
        
        $totalBillingLastMonthEnd = Project::where('created_at', '<=', $endDateLastMonth)->sum('contract_value');
        
        $totalBillingGrowth = 0;
        if ($totalBillingLastMonthEnd > 0) {
            $totalBillingGrowth = round((($totalBilling - $totalBillingLastMonthEnd) / $totalBillingLastMonthEnd) * 100);
        } else if ($totalBilling > 0) {
            $totalBillingGrowth = 100;
        }

        // Percentage of Completed Projects Value vs Total Billing
        $completedBilling = Project::where('status', 'Completed')->sum('contract_value');
        $completedBillingPercentage = $totalBilling > 0 ? round(($completedBilling / $totalBilling) * 100) : 0;

        // Due Projects (Ongoing & Pending)
        $dueProjects = Project::whereIn('status', ['Ongoing', 'Pending'])
            ->whereNotNull('due_date')
            ->orderBy('due_date', 'asc')
            ->take(5)
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

        // Recent Projects Table
        $recentProjectsList = Project::with(['pic', 'company'])
            ->latest()
            ->take(5)
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

        // Project Progress Trend (Average progress per month for the current year)
        $currentYear = Carbon::now()->year;
        $months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
        
        $chartPoints = collect($months)->map(function ($month, $index) use ($currentYear) {
            $monthNum = $index + 1;
            
            // Average progress of projects created in this month
            // Alternatively, average of all projects updated this month
            // We'll use created_at to show trend among new projects, or updated_at for active activity.
            // Let's use updated_at to reflect recent activity.
            $avgProgress = Project::whereYear('updated_at', $currentYear)
                                  ->whereMonth('updated_at', $monthNum)
                                  ->avg('progress') ?? 0;
            
            return [
                'month' => $month,
                'val' => (int) round($avgProgress)
            ];
        })->toArray();

        return Inertia::render('Dashboard', [
            'queryParams' => (object)$request->query(),
            'activityLogs' => $activityLogs,
            'recentActivities' => $recentActivities,
            'dueProjects' => $dueProjects,
            'recentProjectsList' => $recentProjectsList,
            'chartPoints' => $chartPoints,
            'metrics' => [
                'totalBilling' => $totalBilling,
                'totalBillingGrowth' => $totalBillingGrowth,
                'completedBillingPercentage' => $completedBillingPercentage,
                'activeProjects' => $activeProjects,
                'activeGrowth' => $activeGrowth,
                'ongoingProjects' => $ongoingProjects,
                'ongoingGrowth' => $ongoingGrowth,
                'completedProjects' => $completedProjects,
                'completedGrowth' => $completedGrowth,
            ],
        ]);
    }
}
