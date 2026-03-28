<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Friendship;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class FriendshipController extends Controller
{
    //Retorna la llista d'amics del usuari autenticat (relacions d'amistat acceptades)

    public function index()
    {
        $user = Auth::guard('api')->user();

        $friends = Friendship::where('status', 'accepted')
            ->where('user_id', $user->id)
            ->orWhere('friend_id', $user->id)
            ->with(['user', 'friend'])
            ->get()
            ->map(function ($friendship) use ($user) {

                //Determina qui és l'amic en la relació d'amistat (usuari contrari a l'autenticat)
    
                if ($friendship->user_id === $user->id) {
                    $friend = $friendship->friend;
                } else {
                    $friend = $friendship->user;
                }

                return [
                    'id' => $friend->id,
                    'name' => $friend->name,
                    'player_id' => $friend->player_id,
                    'friendship_id' => $friendship->id
                ];
            });

        return response()->json($friends);
    }

    //Funció per enviar la sol·licitud d'amistat a un altre usuari (crea una relació de amistat pendent)

    public function sendFriendRequest(Request $request)
    {
        $user = Auth::guard('api')->user();

        $request->validate([
            'friend_id' => 'required|integer|exists:users,id'
        ]);

        $friend = User::where('user_id', $request->friend_id)->first();

        if (!$friend) {
            return response()->json(['error' => 'Usuario no trobat'], 404);
        }

        if ($friend->user_id === $user->id) {
            return response()->json(['error' => 'No pots enviar-te una sol·licitud d\'amistat a tu mateix'], 400);
        }

        //Verifica bidireccionalment si ja existeix una relació d'amistat entre els dos usuaris
        $existing = Friendship::where(function ($query) use ($user, $friend) {
            $query->where('user_id', $user->id)->where('friend_id', $friend->user_id);
        })->orWhere(function ($query) use ($user, $friend) {
            $query->where('user_id', $friend->user_id)->where('friend_id', $user->id);
        })->first();

        if ($existing) {
            return response()->json(['error' => 'Ja existeix una relació d\'amistat amb aquests usuaris'], 400);
        }

        Friendship::create([
            'user_id' => $user->id,
            'friend_id' => $friend->user_id,
            'status' => 'pending'
        ]);

        return response()->json([
            'message' => 'Sol·licitud d\'amistat enviada correctament a ' . $friend->player_id
        ], 200);
    }

    public function acceptFriendRequest($id)
    {
        $user = Auth::guard('api')->user();

        $friendship = Friendship::where('id', $id)
            ->where('friend_id', $user->id)
            ->where('status', 'pending')
            ->first();

        if (!$friendship) {
            return response()->json([
                'error' => 'Solicitud d\'amistad no trobada'
            ], 404);
        }

        //Actualitza el estat de la sol·licitud de 'pending' a 'accepted' (confirma la amistat)

        $friendship->status = 'accepted';
        $friendship->save();

        return response()->json([   
            'message' => 'Solicitud d\'amistad aceptada'
        ]);
    }

    //Rebutja la sol·licitud d'amistat pendent
    public function rejectFriendRequest($id) {
        $user = Auth::guard('api')->user();

        $friendship = Friendship::where('id', $id)
            ->where('friend_id', $user->id)
            ->where('status', 'pending')
            ->first();

        if (!$friendship) {
            return response()->json([
                'error' => 'Solicitud d\'amistad no trobada'
            ], 404);
        }

        //Elimina la sol·licitud de amistat pendent (rebutja la amistat)

        $friendship->delete();

        return response()->json([
            'message' => 'Solicitud d\'amistad rechazada'
        ]);
    }

    //Elimina la relació d'amistat entre el usuari autenticat i l'usuari contrari ja acceptada (bidireccional)
    public function destroy($id) {
        $user = Auth::guard('api')->user();

        //Busca la relació d'amistat acceptada entre el usuari autenticat i l'usuari contrari (bidireccional)
        $friendship = Friendship::where('id', $id)
        ->where('status', 'accepted')
        ->where(function ($query) use ($user) {
            $query->where('user_id', $user->id)
              ->orWhere('friend_id', $user->id);
        })->first();

        if (!$friendship) {
            return response()->json([
                'error' => 'Relació d\'amistat no trobada'
            ], 404);
        }

        //Elimina la relació d'amistat bidireccional
        $friendship->delete();

        return response()->json([
            'message' => 'Relació d\'amistat entre els usuaris eliminada correctament'
        ]);
    }
}
