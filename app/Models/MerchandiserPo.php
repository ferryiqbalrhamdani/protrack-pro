<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MerchandiserPo extends Model
{
    protected $guarded = [];

    public function merchandiser()
    {
        return $this->belongsTo(Merchandiser::class);
    }

    public function vendor()
    {
        return $this->belongsTo(Vendor::class);
    }

    public function invoices()
    {
        return $this->hasMany(MerchandiserPoInvoice::class, 'merchandiser_po_id');
    }
}
