<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OwnedXuxemon extends Model
{
    public $timestamps = false;

    protected $fillable = ['user_id', 'xuxemon_id', 'number_xuxes', 'size'];

    public function xuxemon()
    {
        return $this->belongsTo(Xuxemon::class);
    }
}
