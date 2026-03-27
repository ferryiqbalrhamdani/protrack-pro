<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BillingFile extends Model
{
    protected $fillable = ['billing_id', 'file_name', 'file_path', 'file_size', 'file_type'];

    public function billing()
    {
        return $this->belongsTo(Billing::class);
    }
}
