<?php

use App\Models\Battle;
use App\Models\Conversation;
use Illuminate\Support\Facades\Broadcast;

/**
 * Fitxer de definició de canals de broadcasting (WebSocket).
 * Aquí es registren els canals privats que utilitza l'aplicació
 * per enviar events en temps real als usuaris.
 *
 * Cada canal privat té una funció d'autorització que comprova
 * si l'usuari autenticat té permís per escoltar-lo.
 * Si retorna true, l'usuari pot connectar-se; si retorna false, no.
 */

// ============================================================
//  Canal de batalles — battle.{battle_id}
// ============================================================
// Permet que els dos jugadors d'una batalla rebin actualitzacions
// en temps real (torns, atacs, resultats, etc.).
// Només poden escoltar-lo els dos participants de la batalla.
Broadcast::channel('battle.{battle_id}', function ($user, $battle_id) {
    // Si no hi ha usuari autenticat, deneguem l'accés
    if (!$user) {
        return false;
    }

    // Busquem la batalla i comprovem que l'usuari sigui un dels dos jugadors
    $battle = Battle::find($battle_id);
    return $battle && ($battle->player_one_id === $user->id || $battle->player_two_id === $user->id);
});

// ============================================================
//  Canal del xat — chat.{conversation_id}
// ============================================================
// Permet que els dos participants d'una conversa rebin missatges
// nous, edicions i eliminacions en temps real.
// Només poden escoltar-lo el sender i el receiver de la conversa.
Broadcast::channel('chat.{conversation_id}', function ($user, $conversation_id) {
    // Si no hi ha usuari autenticat, deneguem l'accés
    if (!$user) {
        return false;
    }

    // Comprovem que existeixi una conversa amb aquest ID
    // on l'usuari autenticat sigui el sender o el receiver
    return Conversation::query()
        ->where('id', $conversation_id)
        ->where(function ($query) use ($user) {
            $query->where('sender_id', $user->id)
                ->orWhere('receiver_id', $user->id);
        })
        ->exists();
});
