<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Illness extends Model
{
    protected $fillable = ['key', 'name', 'description', 'infection_percentage'];
    public $timestamps = false;
}
