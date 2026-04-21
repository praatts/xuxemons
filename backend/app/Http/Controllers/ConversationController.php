<?php

namespace App\Http\Controllers;

use Auth;
use Illuminate\Http\Request;
use App\Models\Conversation;
use App\Models\Message;

class ConversationController extends Controller
{
    public function createConversation(Request $request) {
        $request->validate([
            'receiver_id' => 'required|exists:users,id',
        ]);

        //Obtenim usuari autenticat
        $user = Auth::guard('api')->user();
        $sender_id = $user->id;
        $receiver_id = $request->input('receiver_id');

        // Verifiquem si ja existeix una conversa entre els dos usuaris (en qualsevol direcció)
        $conversation = Conversation::where(function ($query) use ($sender_id, $receiver_id) {
            $query->where('sender_id', $sender_id)
                ->where('receiver_id', $receiver_id);
        })->orWhere(function ($query) use ($sender_id, $receiver_id) {
            $query->where('sender_id', $receiver_id)
                ->where('receiver_id', $sender_id);
        })->first();

        if (!$conversation) {
            // Si no existeix, crear una nova conversa
            $conversation = Conversation::create([
                'sender_id' => $sender_id,
                'receiver_id' => $receiver_id,
            ]);
        }

        return response()->json($conversation);
    }
}
