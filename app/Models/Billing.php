<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Billing extends Model
{
    protected $guarded = [];

    protected $with = ['basts', 'items', 'files'];

    public function project()
    {
        return $this->belongsTo(Project::class);
    }

    public function handle()
    {
        return $this->belongsTo(User::class, 'handle_id');
    }

    public function basts()
    {
        return $this->hasMany(BillingBast::class);
    }

    public function items()
    {
        return $this->hasMany(BillingItem::class);
    }

    public function getProgressAttribute()
    {
        $total = $this->items()->count();
        if ($total == 0) return 0;
        
        $completed = $this->items()->where('completed', true)->count();
        return (int) round(($completed / $total) * 100);
    }

    public function files()
    {
        return $this->hasMany(BillingFile::class);
    }

    public function lastModifier()
    {
        return $this->belongsTo(User::class, 'last_modifier_id');
    }
}
