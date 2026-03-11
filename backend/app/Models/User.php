<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Tymon\JWTAuth\Contracts\JWTSubject;

class User extends Authenticatable implements JWTSubject
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'player_id',
        'name',
        'surname',
        'email',
        'password',
        'role',
        'pfp',
        'level',
        'xp',
        'active',
        'active_friends',
        'streak'
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
     * Get the identifier that will be stored in the JWT token.
     */
    public function getJWTIdentifier()
    {
        return $this->getKey();
    }

    /**
     * Return an array with custom claims to be added to the JWT token.
     */
    public function getJWTCustomClaims()
    {
        return [];
    }

    /* permite obtener tus slots del inventario */
    public function inventory()
    {
        return $this->hasMany(Inventory::class);
    }

    public function getUsedSlots(): int
    {
        return $this->inventory->sum(function ($slot) {
            return ceil($slot->quantity / $slot->item->max_capacity);
        });
    }

    //Función que devuelve el número de slots disponibles en la mochila del usuario
    public function getAvailableSlots()
    {
        return 20 - $this->getUsedSlots();
    }
}
