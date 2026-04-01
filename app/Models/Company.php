<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Company extends Model
{
    protected $fillable = ['name', 'status', 'address', 'phone', 'email', 'website'];

    public function projects()
    {
        return $this->hasMany(Project::class);
    }
}
