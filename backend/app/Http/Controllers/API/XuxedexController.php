<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Xuxe;
use App\Models\Inventory;
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

        $collection = OwnedXuxemon::with('xuxemon')
            ->where('user_id', $user->id)
            ->get();

        return response()->json($collection);
    }

    //GET /api/xuxedex/users
    //se consulta la lista de todos los jugadores
    public function users(): JsonResponse
    {
        $users = User::select('id', 'player_id', 'name')->get();
        return response()->json($users);
    }

    // POST /api/xuxedex/add-random/{userId}
    // Añade un xuxemon aleatorio al inventario de un jugador concreto
    public function addRandom(int $userId): JsonResponse
    {
        // Buscamos el jugador por su ID. Si no existe, devuelve error 404 automáticamente.
        $target = User::findOrFail($userId);

        // Cogemos un xuxe al azar de la tabla 'xuxes'
        $xuxe = Xuxemon::inRandomOrder()->first();

        // Si no hay ningún xuxe en la base de datos, salimos con error
        if (!$xuxe) {
            return response()->json(['error' => 'No hi ha xuxes a la base de datos.'], 404);
        }

        // Comprobamos si el jugador ya tiene este xuxe en su inventario
        $existing = Inventory::where('user_id', $target->id)
            ->where('xuxe_id', $xuxe->id)
            ->first();

        // Si ya lo tiene, sumamos 1. Si no, creamos un registro nuevo.
        if ($existing) {
            $existing->increment('quantity');
            $message = 'Ja tenia aquest xuxemon, quantitat incrementada.';
        } else {
            Inventory::create([
                'user_id'  => $target->id,
                'xuxe_id'  => $xuxe->id,
                'quantity' => 1,
            ]);
            $message = 'Nou xuxemon afegit!';
        }

        return response()->json(['message' => $message, 'xuxe' => $xuxe], 201);
    }
}
