<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Merchandiser extends Model
{
    protected $fillable = [
        'project_id', 'status', 'bank_name', 'account_number', 'account_name',
        'contract_item', 'contract_ea', 'prod_item', 'prod_ea', 'prod_etd',
        'ship_item', 'ship_ea', 'ship_etd', 'stock_item', 'stock_ea',
        'rec_item', 'rec_ea', 'handle_id', 'last_modifier_id'
    ];

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
