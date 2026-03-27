<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BillingBast extends Model
{
    protected $fillable = ['billing_id', 'no_bast', 'tgl_bast'];

    public function billing()
    {
        return $this->belongsTo(Billing::class);
    }
}
