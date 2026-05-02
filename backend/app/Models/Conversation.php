<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\Message;

/**
 * Model que representa una conversa entre dos usuaris.
 *
 * Cada conversa té un emissor (sender_id) i un receptor (receiver_id).
 * Tots els missatges de la conversa s'accedeixen a través de la relació hasMany.
 *
 * Important: sender_id i receiver_id no indiquen "qui parla" en cada missatge,
 * sinó qui va iniciar la conversa (sender) i amb qui (receiver).
 * Després, qualsevol dels dos pot enviar missatges dins la mateixa conversa.
 */
class Conversation extends Model
{
    // Camps que es poden omplir massivament (via Conversation::create())
    protected $fillable = ['sender_id', 'receiver_id' ];

    // Relació: una conversa té molts missatges associats
    public function messages()
    {
        return $this->hasMany(Message::class);
    }
}
