<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OwnedXuxemonIllness extends Model
{
    protected $table = 'owned_xuxemon_illnesses';
    protected $fillable = ['owned_xuxemon_id', 'illness'];
}
