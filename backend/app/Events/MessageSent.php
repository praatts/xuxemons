<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

/**
 * Event que es dispara quan un usuari envia un missatge nou en una conversa.
 *
 * Implementa ShouldBroadcastNow (en comptes de ShouldBroadcast) perquè
 * l'event s'emeti immediatament sense passar per la cua de jobs,
 * garantint que l'altre usuari rebi el missatge al moment.
 *
 * El frontend escolta aquest event al canal privat "chat.{conversation_id}"
 * amb el nom "message.sent" per afegir el missatge a la llista en temps real.
 */
class MessageSent implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

   // El missatge complet que s'ha enviat (objecte Message amb id, content, sender_id, etc.)
   public $message;
   // ID de la conversa on s'ha enviat el missatge (per saber a quin canal emetre'l)
   public $conversation_id;

   // Rep el missatge i l'ID de la conversa quan es crea l'event
   public function __construct($message, $conversation_id)
   {
       $this->message = $message;
       $this->conversation_id = $conversation_id;
   }

   // Defineix a quin canal s'emetrà l'event (canal privat del xat d'aquesta conversa)
   public function broadcastOn()
   {
       return new PrivateChannel('chat.' . $this->conversation_id);
   }

   // Nom personalitzat de l'event (el frontend escolta ".message.sent")
   public function broadcastAs()
   {
       return 'message.sent';
   }

   // Dades que s'envien amb l'event (el missatge complet perquè el frontend el pugui mostrar)
   public function broadcastWith()
   {
       return [
           'message' => $this->message,
       ];
   }
}
