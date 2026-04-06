<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AiSetting extends Model
{
    protected $fillable = [
        'provider',
        'api_key',
        'model',
        'is_active',
    ];

    /**
     * Get the active AI setting.
     */
    public static function getActive()
    {
        return self::where('is_active', true)->first();
    }
}
