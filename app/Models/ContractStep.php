<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ContractStep extends Model
{
    protected $fillable = ['contract_id', 'name', 'completed', 'order'];

    public function contract()
    {
        return $this->belongsTo(Contract::class);
    }
}
