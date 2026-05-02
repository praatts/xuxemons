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
 * Event que es dispara quan un usuari edita el contingut d'un missatge.
 *
 * S'emet immediatament (ShouldBroadcastNow) al canal privat de la conversa
 * perquè l'altre participant vegi el nou contingut del missatge al moment.
 *
 * El frontend escolta aquest event amb el nom "message.updated"
 * i actualitza el contingut i la data d'edició del missatge a la UI.
 */
class MessageUpdated implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    // El missatge actualitzat complet (amb el nou contingut i la nova data updated_at)
    public $message;
    // ID de la conversa (per saber a quin canal emetre l'event)
    public $conversation_id;

    // Rep el missatge editat i l'ID de la conversa
    public function __construct($message, $conversation_id)
    {
        $this->message = $message;
        $this->conversation_id = $conversation_id;
    }

    // Emet l'event al canal privat del xat corresponent a la conversa
    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('chat.' . $this->conversation_id),
        ];
    }

    // Nom personalitzat de l'event (el frontend escolta ".message.updated")
    public function broadcastAs()
    {
        return 'message.updated';
    }

    // Enviem el missatge complet perquè el frontend pugui actualitzar el contingut i la data
    public function broadcastWith()
    {
        return [
            'message' => $this->message,
        ];
    }
}
