<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Facades\Storage;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, HasRoles;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'username',
        'password',
        'profile_photo',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    /**
     * The accessors to append to the model's array form.
     */
    protected $appends = ['profile_photo_url'];

    /**
     * Get the URL for the user's profile photo.
     */
    public function getProfilePhotoUrlAttribute(): string
    {
        if ($this->profile_photo && Storage::disk('public')->exists($this->profile_photo)) {
            return Storage::disk('public')->url($this->profile_photo);
        }

        return 'https://ui-avatars.com/api/?name=' . urlencode($this->name) . '&background=1a2b3c&color=fff&size=128';
    }
}
