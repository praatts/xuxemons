<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

/**
 * Event que es dispara quan un usuari elimina un missatge d'una conversa.
 *
 * S'emet immediatament (ShouldBroadcastNow) al canal privat de la conversa
 * perquè l'altre participant vegi el missatge com a "eliminat" al moment,
 * sense necessitat de refrescar la pàgina.
 *
 * El frontend escolta aquest event amb el nom "message.deleted"
 * i marca el missatge corresponent com a eliminat a la UI.
 */
class MessageDeleted implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    // ID del missatge que s'ha eliminat (per identificar-lo al frontend)
    public $message_id;
    // ID de la conversa (per saber a quin canal emetre l'event)
    public $conversation_id;

    // Rep l'ID del missatge eliminat i l'ID de la conversa
    public function __construct($message_id, $conversation_id)
    {
        $this->message_id = $message_id;
        $this->conversation_id = $conversation_id;  
    }

    // Emet l'event al canal privat del xat corresponent a la conversa
    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('chat.' . $this->conversation_id),
        ];
    }

    // Nom personalitzat de l'event (el frontend escolta ".message.deleted")
    public function broadcastAs()
    {
        return 'message.deleted';
    }

    // Només enviem l'ID del missatge eliminat (el frontend no necessita més dades)
    public function broadcastWith()
    {
        return [
            'message_id' => $this->message_id,
        ];
    }
}
