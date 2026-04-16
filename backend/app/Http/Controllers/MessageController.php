<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Message;
use App\Models\Conversation;
use App\Models\User;
use Auth;

class MessageController extends Controller
{
    //Funció per enviar un missatge en una conversa existent
    public function store(Request $request)
    {

        $request->validate([
            'content' => 'required|string',
            'conversation_id' => 'required|exists:conversations,id',
        ]);

        //Obtenim usuari autenticat i dades del missatge
        $user = Auth::guard('api')->user();
        $conversation_id = $request->input('conversation_id');
        $content = $request->input('content');

        //Carregem la conversa
        $conversation = Conversation::find($conversation_id);

        //Comprovem que la conversa existeix
        if (!$conversation) {
            return response()->json(['error' => 'Conversa no trobada'], 404);
        }

        //Comprovem que l'usuari autenticat és part de la conversa (o sender o receiver)
        if ($conversation->sender_id !== $user->id && $conversation->receiver_id !== $user->id) {
            return response()->json(['error' => 'No tens permís per enviar missatges en aquesta conversa'], 403);
        }

        //Creem el missatge
        $message = Message::create([
            'conversation_id' => $conversation_id,
            'sender_id' => $user->id,
            'content' => $content,
        ]);

        return response()->json();
    }

    //Funció per obtenir els missatges d'una conversa
    public function index(Request $request) {
        $request->validate([
            'conversation_id' => 'required|exists:conversations,id',
        ]);

        //Obtenim usuari autenticat i id de la conversa
        $user = Auth::guard('api')->user();
        $conversation_id = $request->input('conversation_id');

        //Carreguem la conversa
        $conversation = Conversation::find($conversation_id);

        //Comprovem que la conversa existeix
        if (!$conversation) {
            return response()->json(['error' => 'Conversa no trobada'], 404);
        }

        //Comprovem que l'usuari autenticat és part de la conversa (o sender o receiver)
        if ($conversation->sender_id !== $user->id && $conversation->receiver_id !== $user->id) {
            return response()->json(['error' => 'No tens permís per veure els missatges d\'aquesta conversa'], 403);
        }

        //Carreguem els missatges de la conversa de manera ordenada per data de creació (utilitzant la relació definida al model Conversation)
        $messages =  $conversation->messages()->orderBy('created_at', 'asc')->get();
       
        return response()->json($messages);
    }

    
}
