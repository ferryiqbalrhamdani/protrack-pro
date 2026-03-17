<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ContractAttachment extends Model
{
    protected $guarded = [];

    public function contract()
    {
        return $this->belongsTo(Contract::class);
    }
}
