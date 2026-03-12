<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Xuxemon;
use Illuminate\Http\JsonResponse;
use Tymon\JWTAuth\Facades\JWTAuth;
use App\Models\OwnedXuxemon;

class XuxedexController extends Controller
{

    public function allXuxemons(): JsonResponse
    {
        return response()->json(Xuxemon::all());
    }
    // GET api/xuxedex
    // Devuelve la colección completa de los xuxemons del usuario actual
    public function index(): JsonResponse
    {
        $user = JWTAuth::parseToken()->authenticate();

        $xuxemons = Xuxemon::all()->map(function ($xuxemon) use ($user) {
            $data = $xuxemon->toArray();
            $data['owned'] = OwnedXuxemon::where('user_id', $user->id)
                ->where('xuxemon_id', $xuxemon->id)
                ->exists();
            return $data;
        });

        return response()->json($xuxemons);
    }

    //GET /api/xuxedex/users
    //se consulta la lista de todos los jugadores
    public function users(): JsonResponse
    {
        $users = User::select('id', 'player_id', 'name')->get();
        return response()->json($users);
    }

    // POST /api/xuxedex/add-random/{user_id}
    // Añade un xuxemon aleatorio al inventario de un jugador concreto
    public function addRandom($user_id): JsonResponse
    {
        $user = User::findOrFail($user_id);

        // Cogemos un xuxe al azar de la tabla 'xuxes'
        $xuxe = Xuxemon::inRandomOrder()->first();
        $xuxemon = Xuxemon::inRandomOrder()->first();

        if (!$xuxemon) {
            return response()->json(['error' => 'No hi ha xuxemons a la base de datos.'], 404);
        }

        OwnedXuxemon::create([
            'user_id'      => $user->id,
            'xuxemon_id'   => $xuxemon->id,
            'number_xuxes' => 0,
            'size'         => $xuxemon->size,
        ]);

        return response()->json(['message' => 'Nou xuxemon afegit!', 'xuxemon' => $xuxemon], 201);
    }
}
