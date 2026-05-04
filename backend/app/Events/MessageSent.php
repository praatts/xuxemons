<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class MessageSent implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

   public $message;
   public $conversation_id;

   public function __construct($message, $conversation_id)
   {
       $this->message = $message;
       $this->conversation_id = $conversation_id;
   }

   //Define a que canal se se enviará el evento
   public function broadcastOn()
   {
       return new PrivateChannel('chat.' . $this->conversation_id); //canal privado (pusher no se lo puede mandar a cualquier usuario)
   }

   //Es lo que escucha el frontend
   public function broadcastAs()
   {
       return 'message.sent';
   }

   //empaqueta el mensaje completo
   public function broadcastWith()
   {
       return [
           'message' => $this->message,
       ];
   }
}
