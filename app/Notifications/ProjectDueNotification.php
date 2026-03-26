<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Notification;
use App\Models\Project;

class ProjectDueNotification extends Notification implements ShouldBroadcast
{
    use Queueable;

    public $project;
    public $daysLeft;

    public function __construct(Project $project, int $daysLeft)
    {
        $this->project = $project;
        $this->daysLeft = $daysLeft;
    }

    public function via(object $notifiable): array
    {
        return ['database', 'broadcast'];
    }

    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'project',
            'action' => 'due',
            'title' => 'Tagihan/Proyek Jatuh Tempo',
            'message' => 'Proyek "' . $this->project->name . '" segera jatuh tempo dalam ' . $this->daysLeft . ' hari.',
            'project_id' => $this->project->id,
        ];
    }

    public function toBroadcast(object $notifiable): BroadcastMessage
    {
        return new BroadcastMessage($this->toArray($notifiable));
    }
}
