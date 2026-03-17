<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MerchandiserPoInvoice extends Model
{
    protected $guarded = [];

    public function po()
    {
        return $this->belongsTo(MerchandiserPo::class, 'merchandiser_po_id');
    }
}
