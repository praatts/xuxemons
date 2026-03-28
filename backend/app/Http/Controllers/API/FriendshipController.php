<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Friendship;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class FriendshipController extends Controller
{
    //Devuelve las amistades bidireccionales del usuario autenticado (enviadas y recibidas)

    public function index()
    {
        $user = Auth::guard('api')->user();

        $friends = Friendship::where('status', 'accepted')
            ->where('user_id', $user->id)
            ->orWhere('friend_id', $user->id)
            ->with(['user', 'friend'])
            ->get()
            ->map(function ($friendship) use ($user) {

                //Determina quién es el amigo en la relación de amistad (usuario contrario al autenticado)
    
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
            'message' => 'Sol·licitud d\'amistat enviada correctament a ' . $friend->player_id], 200);
    }

    
}
