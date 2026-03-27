<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BillingItem extends Model
{
    protected $fillable = ['billing_id', 'name', 'type', 'completed'];

    protected $casts = [
        'completed' => 'boolean',
    ];

    public function billing()
    {
        return $this->belongsTo(Billing::class);
    }
}
