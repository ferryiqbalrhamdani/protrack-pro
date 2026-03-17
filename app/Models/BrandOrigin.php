<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BrandOrigin extends Model
{
    protected $fillable = ['name'];

    public function certifications()
    {
        return $this->hasMany(Certification::class);
    }
}
