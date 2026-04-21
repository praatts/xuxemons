<?php

namespace App\Events;

use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class BattleUpdated implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $battle;
    public $battle_id;

    public function __construct($battle_id, $battle)
    {
        $this->battle_id = $battle_id;
        $this->battle = $battle;
    }

    public function broadcastOn()
    {
        return new PrivateChannel('battle.' . $this->battle_id);
    }

    public function broadcastAs()
    {
        return 'battle.updated';
    }

    public function broadcastWith()
    {
        return [
            'battle' => $this->battle,
        ];
    }
}
