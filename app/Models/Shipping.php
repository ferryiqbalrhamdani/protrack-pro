<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Shipping extends Model
{
    protected $fillable = ['project_id', 'status', 'shipping_type', 'shipping_date', 'handle_id', 'last_modifier_id'];

    protected $with = ['documents', 'files'];

    public function project()
    {
        return $this->belongsTo(Project::class);
    }

    public function handle()
    {
        return $this->belongsTo(User::class, 'handle_id');
    }

    public function documents()
    {
        return $this->hasMany(ShippingDocument::class);
    }

    public function files()
    {
        return $this->hasMany(ShippingFile::class);
    }

    public function lastModifier()
    {
        return $this->belongsTo(User::class, 'last_modifier_id');
    }

    public function getProgressAttribute()
    {
        if ($this->status === 'Completed') return 100;

        $total = 1; // shipping_date
        $filled = 0;
        
        if ($this->shipping_date) $filled++;

        foreach ($this->documents as $doc) {
            $total += 2; // no and date
            if ($doc->doc_no) $filled++;
            if ($doc->doc_date) $filled++;
        }
        
        return (int) round(($filled / max(1, $total)) * 100);
    }
}
