<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProjectInstallment extends Model
{
    protected $fillable = ['project_id', 'name', 'percentage', 'value'];

    public function project()
    {
        return $this->belongsTo(Project::class);
    }
}
