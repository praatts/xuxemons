<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Model que representa un missatge del xat.
 *
 * Cada missatge pertany a una conversa (conversation_id) i té un remitent (sender_id).
 * El camp 'deleted' (booleà) permet fer soft delete: en comptes de borrar el missatge
 * de la BD, el marquem com a eliminat i la UI mostra "Aquest missatge ha estat eliminat".
 */
class Message extends Model
{
    // Camps que es poden omplir massivament (via Message::create())
    protected $fillable = ['conversation_id', 'sender_id', 'content'];

    // Relació: cada missatge pertany a un usuari (el remitent)
    public function sender()
    {
        return $this->belongsTo(User::class, 'sender_id');
    }
}
