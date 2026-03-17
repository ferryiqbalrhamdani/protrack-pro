<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ShippingDocument extends Model
{
    protected $guarded = [];

    public function shipping()
    {
        return $this->belongsTo(Shipping::class);
    }
}
