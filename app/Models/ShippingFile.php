<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ShippingFile extends Model
{
    protected $fillable = ['shipping_id', 'file_name', 'file_path', 'file_size', 'file_type'];

    public function shipping()
    {
        return $this->belongsTo(Shipping::class);
    }
}
