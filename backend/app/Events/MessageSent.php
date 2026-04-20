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

   public function broadcastOn()
   {
       return new PrivateChannel('chat.' . $this->conversation_id);
   }

   public function broadcastAs()
   {
       return 'message.sent';
   }

   public function broadcastWith()
   {
       return [
           'message' => $this->message,
       ];
   }
}
