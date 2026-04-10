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

   //Relació Molts a molts entre OwnedXuxemons i illnesses, amb la taula pivot owned_xuxemon_illnesses
    public function illnesses()
    {
        return $this->belongsToMany(Illness::class, 'owned_xuxemon_illnesses');
    }
}
