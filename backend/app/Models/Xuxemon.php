<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;


// Modelo que representa un xuxemon del catálogo (agua, tierra, aire — petit, mitja, gran)
class Xuxemon extends Model
{
    /** @use HasFactory<\Database\Factories\XuxeFactory> */
    use HasFactory;

    // La tabla 'xuxemons' no tiene columnas created_at ni updated_at
    public $timestamps = false;
    protected $table = 'xuxemons';

    protected $fillable = [
        'name',
        'type',
        'size',
        'xuxes'
    ];

    public function inventories()
    {
        return $this->hasMany(Inventory::class, 'xuxe_id');
    }
}
