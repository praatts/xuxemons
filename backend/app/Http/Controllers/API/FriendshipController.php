<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Friendship;
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
}
