<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Notification;
use App\Models\Project;
use App\Models\User;

class ProjectUpdatedNotification extends Notification implements ShouldBroadcast
{
    use Queueable;

    public $project;
    public $user;
    public $actionType;

    public function __construct(Project $project, User $user, string $actionType = 'updated')
    {
        $this->project = $project;
        $this->user = $user;
        $this->actionType = $actionType;
    }

    public function via(object $notifiable): array
    {
        return ['database', 'broadcast'];
    }

    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'project',
            'action' => $this->actionType,
            'title' => $this->actionType === 'created' ? 'Proyek Baru' : 'Proyek Diperbarui',
            'message' => 'Proyek "' . $this->project->name . '" telah ' . ($this->actionType === 'created' ? 'dibuat' : 'diperbarui') . ' oleh ' . $this->user->name . '.',
            'project_id' => $this->project->id,
            'user_id' => $this->user->id,
        ];
    }

    public function toBroadcast(object $notifiable): BroadcastMessage
    {
        return new BroadcastMessage($this->toArray($notifiable));
    }
}
