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

class MessageDeleted implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $message_id;
    public $conversation_id;
    /**
     * Create a new event instance.
     */
    public function __construct($message_id, $conversation_id)
    {
        $this->message_id = $message_id;
        $this->conversation_id = $conversation_id;  
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return array<int, \Illuminate\Broadcasting\Channel>
     */
    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('chat.' . $this->conversation_id),
        ];
    }

    public function broadcastAs()
    {
        return 'message.deleted';
    }

    public function broadcastWith()
    {
        return [
            'message_id' => $this->message_id,
        ];
    }
}
