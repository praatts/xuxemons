<?php

use App\Models\Conversation;
use Illuminate\Support\Facades\Broadcast;

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
