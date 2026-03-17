<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Certification extends Model
{
    protected $fillable = ['brand_origin_id', 'name'];

    public function brandOrigin()
    {
        return $this->belongsTo(BrandOrigin::class);
    }
}
