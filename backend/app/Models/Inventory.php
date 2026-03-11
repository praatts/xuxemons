<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\Xuxemon;

class Inventory extends Model
{
    protected $table = 'inventory';

    public $timestamps = false;

    protected $fillable = ['user_id', 'item_id', 'quantity'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // Relación con el catálogo de xuxemons
    public function xuxemon()
    {
        return $this->belongsTo(Xuxemon::class, 'xuxe_id');
    }

    public function item()
    {
        return $this->belongsTo(Item::class);
    }
}
