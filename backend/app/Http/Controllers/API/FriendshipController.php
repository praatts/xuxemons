<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Friendship;
use App\Models\Notification;
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
            ->where(function ($query) use ($user) {
                $query->where('user_id', $user->id)
                    ->orWhere('friend_id', $user->id);
            })
            ->with(['user', 'friend'])
            ->get()
            ->map(function ($friendship) use ($user) {
                //Determina qui és l'amic en la relació d'amistat (l'altre usuari que no és el autenticat)
                if ($friendship->user_id === $user->id) {
                    $friend = $friendship->friend;
                } else {
                    $friend = $friendship->user;
                }

                return [
                    'friendship_id' => $friendship->id,
                    'id' => $friend->id,
                    'name' => $friend->name,
                    'player_id' => $friend->player_id,
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

        $friend = User::where('id', $request->friend_id)->first();

        if (!$friend) {
            return response()->json(['error' => 'Usuario no trobat'], 404);
        }

        if ($friend->id === $user->id) {
            return response()->json(['error' => 'No pots enviar-te una sol·licitud d\'amistat a tu mateix'], 400);
        }

        //Verifica bidireccionalment si ja existeix una relació d'amistat entre els dos usuaris
        $existing = Friendship::where(function ($query) use ($user, $friend) {
            $query->where('user_id', $user->id)->where('friend_id', $friend->id);
        })->orWhere(function ($query) use ($user, $friend) {
            $query->where('user_id', $friend->id)->where('friend_id', $user->id);
        })->first();

        if ($existing) {
            return response()->json(['error' => 'Ja existeix una relació d\'amistat amb aquests usuaris'], 400);
        }

        Friendship::create([
            'user_id' => $user->id,
            'friend_id' => $friend->id,
            'status' => 'pending'
        ]);

        //Notificació per l'usuari destinatari de la sol·licitud d'amistat
        Notification::create([
            'user_id' => $friend->id,
            'title' => 'Nova solicitud d\'amistad',
            'message' => 'Has rebut una nova solicitud d\'amistad de ' . $user->player_id
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

        //Crea una notificació per l'usuari remitent de la sol·licitud d'amistat
        //  informant que la sol·licitud ha estat acceptada

        Notification::create([
            'user_id' => $friendship->user_id,
            'title' => 'Solicitud d\'amistad aceptada',
            'message' => 'La solicitud d\'amistad ha estat acceptada per ' . $user->player_id . 
            '. Ara sou amics!'
        ]);

        return response()->json([
            'message' => 'Solicitud d\'amistad aceptada'
        ]);
    }

    //Rebutja la sol·licitud d'amistat pendent
    public function rejectFriendRequest($id)
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

        //Elimina la sol·licitud de amistat pendent (rebutja la amistat)

        $friendship->delete();

        return response()->json([
            'message' => 'Solicitud d\'amistad rechazada'
        ]);
    }

    //Elimina la relació d'amistat entre el usuari autenticat i l'usuari contrari ja acceptada (bidireccional)
    public function destroy($id)
    {
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

    // Retorna les sol·licituds d'amistat pendents rebudes pel usuari autenticat
    public function getRequests()
    {
        $user = Auth::guard('api')->user();

        $requests = Friendship::where('friend_id', $user->id)
            ->where('status', 'pending')
            ->with('user')
            ->get()
            ->map(function ($friendship) {
                return [
                    'friendship_id' => $friendship->id,
                    'id' => $friendship->user->id,
                    'name' => $friendship->user->name,
                    'player_id' => $friendship->user->player_id,
                ];
            });

        return response()->json($requests);
    }

    //Mètode per obtenir tots els usuaris actius menys l'autenticat (gestió de sol·licituds d'amistat)

    public function getAllPlayers()
    {
        $user = Auth::guard('api')->user();

        //Retorna tots els usuaris actius excepte l'usuari autenticat
        $user = Auth::guard('api')->user();
        $users = User::where('id', '!=', $user->id)
            ->where('status', 1)
            ->select('id', 'name', 'player_id')
            ->get();

        return response()->json($users);
    }

    //Mètode per obtenir l'estat de totes les relacions d'amistats

    public function getStatus()
    {
        $user = Auth::guard('api')->user();
        $result = [];

        $friendships = Friendship::where('user_id', $user->id)
            ->orWhere('friend_id', $user->id)
            ->get();

        foreach ($friendships as $friendship) {
            if ($friendship->user_id == $user->id) {
                $other_id = $friendship->friend_id;
            } else {
                $other_id = $friendship->user_id;
            }
            $result[$other_id] = [
                'status' => $friendship->status,
                'friendship_id' => $friendship->id,
                'sender' => $friendship->user_id === $user->id //Retorna true/false si l'usuari autenticat es el remitent de la sol·licitud d'amistat
            ];
        }

        return response()->json($result);
    }

    //Mètode per obtenir les sol·licituds d'amistat pendents enviades pel usuari autenticat

    public function getSentRequests()
    {

        $user = Auth::guard('api')->user();

        $requests = Friendship::where('user_id', $user->id)
            ->where('status', 'pending')
            ->with('friend')
            ->get()
            ->map(function ($friendship) {
                return [
                    'friendship_id' => $friendship->id,
                    'id' => $friendship->friend->id,
                    'name' => $friendship->friend->name,
                    'player_id' => $friendship->friend->player_id,
                ];
            });

            return response()->json($requests);
    

    }

    //Mètode per eliminar una sol·licitud enviada, però no acceptada encara (rebutjar la sol·licitud enviada)

    public function revokeFriendRequest($id)
    {
        $user = Auth::guard('api')->user();

        $friendship = Friendship::where('id', $id)
            ->where('user_id', $user->id)
            ->where('status', 'pending')
            ->first();

        if (!$friendship) {
            return response()->json([
                'error' => 'Solicitud d\'amistad no trobada'
            ], 404);
        }

        $friendship->delete();

        return response()->json([
            'message' => 'Solicitud d\'amistad revocada correctament'
        ]);
    }
}
