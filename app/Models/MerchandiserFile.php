<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MerchandiserFile extends Model
{
    protected $guarded = [];

    public function merchandiser()
    {
        return $this->belongsTo(Merchandiser::class);
    }
}
