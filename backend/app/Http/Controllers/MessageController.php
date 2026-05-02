<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Message;
use App\Models\Conversation;
use App\Models\User;
use Auth;
use App\Events\MessageSent;
use App\Events\MessageDeleted;
use App\Events\MessageUpdated;

/**
 * Controlador que gestiona totes les operacions amb missatges del xat:
 * enviar, llistar, eliminar i editar.
 *
 * Cada acció comprova que l'usuari autenticat tingui permís per fer-la
 * (ser participant de la conversa i/o autor del missatge).
 *
 * Després de cada modificació (enviar, eliminar, editar), es dispara un event
 * de broadcasting perquè l'altre participant rebi el canvi en temps real.
 */
class MessageController extends Controller
{
    // ============================================================
    //  ENVIAR MISSATGE — POST /api/messages
    // ============================================================

    /**
     * Crea un missatge nou dins d'una conversa existent.
     * Valida que el contingut no estigui buit i que la conversa existeixi,
     * comprova que l'usuari sigui participant de la conversa,
     * guarda el missatge a la BD i emet l'event perquè l'altre usuari el rebi.
     */
    public function store(Request $request)
    {
        // Validem que el missatge tingui contingut i que la conversa existeixi a la BD
        $request->validate([
            'content' => 'required|string',
            'conversation_id' => 'required|exists:conversations,id',
        ]);

        // Obtenim l'usuari autenticat i les dades del missatge
        $user = Auth::guard('api')->user();
        $conversation_id = $request->input('conversation_id');
        $content = $request->input('content');

        // Busquem la conversa per ID
        $conversation = Conversation::find($conversation_id);

        if (!$conversation) {
            return response()->json(['error' => 'Conversa no trobada'], 404);
        }

        // Comprovem que l'usuari autenticat sigui un dels dos participants (sender o receiver)
        if ($conversation->sender_id !== $user->id && $conversation->receiver_id !== $user->id) {
            return response()->json(['error' => 'No tens permís per enviar missatges en aquesta conversa'], 403);
        }

        // Creem el missatge a la base de dades
        $message = Message::create([
            'conversation_id' => $conversation_id,
            'sender_id' => $user->id,
            'content' => $content,
        ]);
        
        // Emetem l'event perquè l'altre participant el rebi en temps real.
        // toOthers() fa que l'event NO s'enviï al propi emissor (evita duplicats)
        broadcast(new MessageSent($message, $conversation_id))->toOthers();

        return response()->json($message, 201);
    }

    // ============================================================
    //  LLISTAR MISSATGES — GET /api/messages
    // ============================================================

    /**
     * Retorna tots els missatges d'una conversa, ordenats per data de creació (antic → nou).
     * Només els participants de la conversa poden veure els missatges.
     */
    public function index(Request $request) {
        $request->validate([
            'conversation_id' => 'required|exists:conversations,id',
        ]);

        $user = Auth::guard('api')->user();
        $conversation_id = $request->input('conversation_id');

        $conversation = Conversation::find($conversation_id);

        if (!$conversation) {
            return response()->json(['error' => 'Conversa no trobada'], 404);
        }

        // Comprovem que l'usuari autenticat sigui participant de la conversa
        if ($conversation->sender_id !== $user->id && $conversation->receiver_id !== $user->id) {
            return response()->json(['error' => 'No tens permís per veure els missatges d\'aquesta conversa'], 403);
        }

        // Carreguem els missatges ordenats cronològicament (del més antic al més nou)
        $messages =  $conversation->messages()->orderBy('created_at', 'asc')->get();
       
        return response()->json($messages);
    }

    // ============================================================
    //  ELIMINAR MISSATGE — DELETE /api/messages/{id}
    // ============================================================

    /**
     * Marca un missatge com a eliminat (soft delete).
     * No el borra de la BD, sinó que posa el camp 'deleted' a true
     * perquè la UI mostri "Aquest missatge ha estat eliminat".
     * Només l'autor del missatge pot eliminar-lo.
     */
    public function destroy($id) {
        $user = Auth::guard('api')->user();
        $message = Message::find($id);

        if (!$message) {
            return response()->json(['error' => 'Missatge no trobat'], 404);
        }

        // Només l'autor (sender) del missatge pot eliminar-lo
        if ($message->sender_id !== $user->id) {
            return response()->json(['error' => 'No tens permís per eliminar aquest missatge'], 403);
        }

        // Marquem com a eliminat (soft delete)
        $message->deleted = true;
        $message->save();

        // Notifiquem l'altre participant perquè actualitzi la seva vista
        broadcast(new MessageDeleted($message->id, $message->conversation_id))->toOthers();

        return response()->json(['message' => 'Missatge eliminat correctament']);
    }

    // ============================================================
    //  EDITAR MISSATGE — PATCH /api/messages/{id}/edit
    // ============================================================

    /**
     * Modifica el contingut d'un missatge existent.
     * Només l'autor del missatge pot editar-lo.
     * Actualitza el contingut a la BD i emet l'event perquè
     * l'altre participant vegi el nou text en temps real.
     */
    public function editMessage(Request $request, $id) {
        $user = Auth::guard('api')->user();
        $message = Message::find($id);

        if (!$message) {
            return response()->json(['error' => 'Missatge no trobat'], 404);
        }

        // Només l'autor del missatge pot editar-lo
        if ($message->sender_id !== $user->id) {
            return response()->json(['error' => 'No tens permís per editar aquest missatge'], 403);
        }

        // Validem que el nou contingut no estigui buit
        $request->validate([
            'content' => 'required|string',
        ]);

        // Actualitzem el contingut del missatge (Laravel actualitza updated_at automàticament)
        $message->content = $request->input('content');
        $message->save();

        // Notifiquem l'altre participant del canvi
        broadcast(new MessageUpdated($message, $message->conversation_id))->toOthers();

        return response()->json($message);
    }
}
