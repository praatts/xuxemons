<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Inventory extends Model
{
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
