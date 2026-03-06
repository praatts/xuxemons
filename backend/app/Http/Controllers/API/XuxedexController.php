<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Xuxemon;
use App\Models\Inventory;
use Illuminate\Http\JsonResponse;
use Tymon\JWTAuth\Facades\JWTAuth;

class XuxedexController extends Controller
{
    // GET api/xuxedex
    // Devuelve la colección completa de los xuxemons del usuario actual
    public function index(): JsonResponse
    {
        $user = JWTAuth::parseToken()->authenticate();

        // Forma más sencilla y fácil de entender usando Eloquent (Modelos):
        // Buscamos en el inventario todos los registros de este usuario,
        // y le pedimos que "cargue" la información del Xuxe ('with xuxe').
        $collection = Inventory::with('xuxemon')
            ->where('user_id', $user->id)
            ->get();

        // Por último, devolvemos la colección al usuario en formato JSON
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

        // Cogemos un xuxemon al azar de la tabla 'xuxemons'
        $xuxemon = Xuxemon::inRandomOrder()->first();

        // Si no hay ningún xuxemon en la base de datos, salimos con error
        if (!$xuxemon) {
            return response()->json(['error' => 'No hi ha xuxemons a la base de datos.'], 404);
        }

        // Comprobamos si el jugador ya tiene este xuxemon en su inventario
        $existing = Inventory::where('user_id', $target->id)
                              ->where('xuxe_id', $xuxemon->id)
                              ->first();

        // Si ya lo tiene, sumamos 1. Si no, creamos un registro nuevo.
        if ($existing) {
            $existing->increment('quantity');
            $message = 'Ja tenia aquest xuxemon, quantitat incrementada.';
        } else {
            Inventory::create([
                'user_id'  => $target->id,
                'xuxe_id'  => $xuxemon->id,
                'quantity' => 1,
            ]);
            $message = 'Nou xuxemon afegit!';
        }

        return response()->json(['message' => $message, 'xuxemon' => $xuxemon], 201);
    }
}
