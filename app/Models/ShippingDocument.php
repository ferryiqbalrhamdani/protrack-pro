<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ShippingDocument extends Model
{
    protected $fillable = ['shipping_id', 'type', 'doc_no', 'doc_date'];

    public function shipping()
    {
        return $this->belongsTo(Shipping::class);
    }
}
