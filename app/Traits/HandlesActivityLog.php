<?php

namespace App\Traits;

use App\Models\ActivityLog;
use Illuminate\Support\Facades\Auth;

trait HandlesActivityLog
{
    protected function logActivity($action, $modelType, $targetName, $icon = null, $color = null)
    {
        ActivityLog::create([
            'user_id' => Auth::id(),
            'action' => $action,
            'model_type' => $modelType,
            'target_name' => $targetName,
            'icon' => $icon,
            'color' => $color,
        ]);
    }
}
