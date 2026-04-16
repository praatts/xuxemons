<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\Message;

class Conversation extends Model
{

    protected $fillable = ['sender_id', 'receiver_id' ];
    public function messages()
    {
        return $this->hasMany(Message::class);
    }
}
