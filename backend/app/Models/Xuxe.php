<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Xuxe extends Model
{
    /** @use HasFactory<\Database\Factories\XuxeFactory> */
    use HasFactory;

    // La tabla 'xuxes' no tiene columnas created_at ni updated_at
    public $timestamps = false;

    protected $fillable = ['name', 'type', 'size'];

    public function inventories()
    {
        return $this->hasMany(Inventory::class);
    }
}
