<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Merchandiser extends Model
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

    public function pos()
    {
        return $this->hasMany(MerchandiserPo::class);
    }

    public function files()
    {
        return $this->hasMany(MerchandiserFile::class);
    }

    public function lastModifier()
    {
        return $this->belongsTo(User::class, 'last_modifier_id');
    }

    public function getProgressAttribute()
    {
        $tab1Ea = (float) $this->contract_ea;
        if ($tab1Ea == 0) return 0;
        
        $penerimaanEa = (float) $this->rec_ea;
        return (int) min(100, round(($penerimaanEa / $tab1Ea) * 100));
    }
}
