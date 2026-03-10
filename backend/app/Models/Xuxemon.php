<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

<<<<<<< HEAD
// Modelo que representa un xuxemon del catálogo (agua, tierra, aire — petit, mitja, gran)
class Xuxemon extends Model
{
=======
class Xuxemon extends Model
{
    /** @use HasFactory<\Database\Factories\XuxeFactory> */
>>>>>>> 34efa8466655cb151f8f37b3bf4f73dd981bcc35
    use HasFactory;

    // La tabla 'xuxemons' no tiene columnas created_at ni updated_at
    public $timestamps = false;

<<<<<<< HEAD
    protected $table = 'xuxemons';

    protected $fillable = ['name', 'type', 'size'];

    public function inventories()
    {
        return $this->hasMany(Inventory::class, 'xuxe_id');
    }
=======
    protected $fillable = ['name', 'type', 'size'];

>>>>>>> 34efa8466655cb151f8f37b3bf4f73dd981bcc35
}
