<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MerchandiserPoInvoice extends Model
{
    protected $fillable = ['merchandiser_po_id', 'invoice_number', 'invoice_date', 'item_count', 'ea_count', 'status'];

    public function po()
    {
        return $this->belongsTo(MerchandiserPo::class, 'merchandiser_po_id');
    }
}
