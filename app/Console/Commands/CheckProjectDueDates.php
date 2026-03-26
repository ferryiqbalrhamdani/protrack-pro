<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Project;
use App\Models\User;
use App\Notifications\ProjectDueNotification;
use Illuminate\Support\Facades\Notification;

class CheckProjectDueDates extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:check-project-due-dates';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Check for projects nearing their due dates and trigger notifications.';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $targetDate = now()->addDays(30)->toDateString();
        
        $projects = Project::where('status', 'Ongoing')
            ->whereDate('due_date', $targetDate)
            ->get();

        if ($projects->isNotEmpty()) {
            $users = User::all();
            foreach ($projects as $project) {
                Notification::send($users, new ProjectDueNotification($project, 30));
            }
            $this->info($projects->count() . ' project due date notifications dispatched.');
        } else {
            $this->info('No projects due in exactly 30 days.');
        }
    }
}
