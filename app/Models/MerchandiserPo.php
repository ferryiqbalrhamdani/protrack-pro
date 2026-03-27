<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MerchandiserPo extends Model
{
    protected $fillable = ['merchandiser_id', 'vendor_id', 'supplier_name_manual', 'po_number', 'item_count', 'ea_count'];

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
