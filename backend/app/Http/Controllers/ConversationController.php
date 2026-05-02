<?php

namespace App\Http\Controllers;

use Auth;
use Illuminate\Http\Request;
use App\Models\Conversation;
use App\Models\Message;

/**
 * Controlador que gestiona la creació de converses del xat.
 *
 * Quan un usuari vol parlar amb un amic, primer es crea (o es recupera)
 * una conversa entre els dos. Si ja n'existia una, es retorna l'existent
 * per evitar duplicats i mantenir tot l'historial de missatges intacte.
 */
class ConversationController extends Controller
{
    // ============================================================
    //  CREAR CONVERSA — POST /api/conversations
    // ============================================================

    /**
     * Crea una conversa nova entre l'usuari autenticat i un altre usuari,
     * o retorna la conversa existent si ja n'hi ha una entre ells.
     *
     * La cerca es fa en ambdues direccions (A→B i B→A) perquè no importa
     * qui va iniciar la conversa originalment, sempre és la mateixa.
     */
    public function createConversation(Request $request) {
        // Validem que l'ID del receptor existeixi a la taula d'usuaris
        $request->validate([
            'receiver_id' => 'required|exists:users,id',
        ]);

        // Obtenim l'ID de l'usuari autenticat (qui inicia la conversa)
        $user = Auth::guard('api')->user();
        $sender_id = $user->id;
        $receiver_id = $request->input('receiver_id');

        // Busquem si ja existeix una conversa entre els dos usuaris (en qualsevol direcció).
        // Per exemple, si A va iniciar una conversa amb B, i ara B vol parlar amb A,
        // retornem la mateixa conversa perquè no es creïn duplicats.
        $conversation = Conversation::where(function ($query) use ($sender_id, $receiver_id) {
            $query->where('sender_id', $sender_id)
                ->where('receiver_id', $receiver_id);
        })->orWhere(function ($query) use ($sender_id, $receiver_id) {
            $query->where('sender_id', $receiver_id)
                ->where('receiver_id', $sender_id);
        })->first();

        // Si no existeix cap conversa entre ells, en creem una de nova
        if (!$conversation) {
            $conversation = Conversation::create([
                'sender_id' => $sender_id,
                'receiver_id' => $receiver_id,
            ]);
        }

        return response()->json($conversation);
    }
}
