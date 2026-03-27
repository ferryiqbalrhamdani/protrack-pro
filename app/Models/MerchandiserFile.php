<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MerchandiserFile extends Model
{
    protected $fillable = ['merchandiser_id', 'file_path', 'file_name', 'file_size', 'mime_type'];

    public function merchandiser()
    {
        return $this->belongsTo(Merchandiser::class);
    }
}
