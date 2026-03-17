<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Contract extends Model
{
    protected $guarded = [];

    public function project()
    {
        return $this->belongsTo(Project::class);
    }

    public function handle()
    {
        return $this->belongsTo(User::class, 'handle_id');
    }

    public function steps()
    {
        return $this->hasMany(ContractStep::class)->orderBy('order');
    }

    public function attachments()
    {
        return $this->hasMany(ContractAttachment::class);
    }

    public function lastModifier()
    {
        return $this->belongsTo(User::class, 'last_modifier_id');
    }

    public function getProgressAttribute()
    {
        $total = $this->steps()->count();
        if ($total === 0) return 0;
        
        $completed = $this->steps()->where('completed', true)->count();
        return round(($completed / $total) * 100);
    }
}
