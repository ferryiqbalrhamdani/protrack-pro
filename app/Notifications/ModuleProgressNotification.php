<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Notification;
use App\Models\User;

class ModuleProgressNotification extends Notification implements ShouldBroadcast
{
    use Queueable;

    public $moduleType; // 'contract', 'merchandiser', 'billing', 'shipping'
    public $status;
    public $user;
    public $projectName;
    public $projectId;
    public $progress;

    public function __construct(string $moduleType, string $status, User $user, string $projectName, $projectId = null, $progress = 0)
    {
        $this->moduleType = $moduleType;
        $this->status = $status;
        $this->user = $user;
        $this->projectName = $projectName;
        $this->projectId = $projectId;
        $this->progress = $progress;
    }

    public function via(object $notifiable): array
    {
        return ['database', 'broadcast'];
    }

    public function toArray(object $notifiable): array
    {
        $titles = [
            'contract' => 'Update Kontrak',
            'merchandiser' => 'Update Merchandiser',
            'billing' => 'Update Penagihan',
            'shipping' => 'Update Pengiriman',
        ];

        return [
            'type' => $this->moduleType,
            'action' => 'updated',
            'title' => $titles[$this->moduleType] ?? 'Update Modul',
            'message' => 'Modul ' . ucfirst($this->moduleType) . ' untuk proyek "' . $this->projectName . '" ' . ($this->progress == 100 ? 'telah mencapai 100% dan ' : '') . 'berstatus "' . $this->status . '" oleh ' . $this->user->name . '.',
            'project_id' => $this->projectId,
            'user_id' => $this->user->id,
        ];
    }

    public function toBroadcast(object $notifiable): BroadcastMessage
    {
        return new BroadcastMessage($this->toArray($notifiable));
    }
}
