<?php

use App\Models\Battle;
use App\Models\Conversation;
use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('battle.{battle_id}', function ($user, $battle_id) {
    if (!$user) {
        return false;
    }

    $battle = Battle::find($battle_id);
    return $battle && ($battle->player_one_id === $user->id || $battle->player_two_id === $user->id);
});

Broadcast::channel('chat.{conversation_id}', function ($user, $conversation_id) {
    if (!$user) {
        return false;
    }

    return Conversation::query()
        ->where('id', $conversation_id)
        ->where(function ($query) use ($user) {
            $query->where('sender_id', $user->id)
                ->orWhere('receiver_id', $user->id);
        })
        ->exists();
});
