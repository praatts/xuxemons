<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Inventory extends Model
{
    // Usamos la tabla 'user_xuxe' que es mucho más sencilla y no tiene límites de slots obligatorios
    protected $table = 'user_xuxe';

    // Desactivamos los timestamps si tu migración no tiene $table->timestamps()
    public $timestamps = false;

    protected $fillable = ['user_id', 'xuxe_id', 'quantity'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function xuxe()
    {
        return $this->belongsTo(Xuxe::class);
    }
}
