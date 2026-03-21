<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\OwnedXuxemon;
use App\Models\OwnedXuxemonIllness;
use App\Models\User;
use App\Models\Xuxemon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Tymon\JWTAuth\Facades\JWTAuth;

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

        return response()->json([
            'id'           => $xuxemon->id,
            'name'         => $xuxemon->name,
            'xuxemon_id'   => $xuxemon->id,
            'number_xuxes' => 0,
            'size'         => $xuxemon->size,
            'owned'        => true,
            'type'         => $xuxemon->type
        ], 201);
    }

    public function ownedXuxemons(): JsonResponse
    {
        $user = JWTAuth::parseToken()->authenticate();

        $owned = OwnedXuxemon::where('user_id', $user->id)->with(['xuxemon', 'illnesses'])->get()
            ->map(function ($owned) {
                return [
                    'id' => $owned->xuxemon->id,
                    'name' => $owned->xuxemon->name,
                    'xuxemon_id' => $owned->xuxemon_id,
                    'number_xuxes' => $owned->number_xuxes,
                    'size' => $owned->size,
                    'owned' => true,
                    'type' => $owned->xuxemon->type,
                    'illnesses' => $owned->illnesses->pluck('illness'),
                ];
            });
        return response()->json($owned);
    }

    // POST /api/xuxedex/{owned_id}/illness
    // Afegeix una malaltia a un xuxemon capturat (només admin)
    public function addIllness(Request $request, $owned_id): JsonResponse
    {
        $request->validate([
            'illness' => 'required|in:bajon_azucar,atracon'
        ], [
            'illness.in' => 'La enfermedad debe ser: bajon_azucar o atracon'
        ]);

        // Usamos find() en lugar de findOrFail() para controlar el error y evitar redirecciones a HTML
        $owned = OwnedXuxemon::find($owned_id);

        if (!$owned) {
            return response()->json([
                'error' => 'No se ha encontrado el Xuxemon con ID: ' . $owned_id
            ]);
        }

        OwnedXuxemonIllness::firstOrCreate([
            'owned_xuxemon_id' => $owned->id,
            'illness'          => $request->illness,
        ]);

        return response()->json(['message' => 'Enfermedad añadida correctamente']);
    }

    // DELETE /api/xuxedex/{owned_id}/illness/{illness}
    // Elimina una malaltia d'un xuxemon capturat (només admin)
    public function removeIllness($owned_id, $illness): JsonResponse
    {
        OwnedXuxemonIllness::where('owned_xuxemon_id', $owned_id)
            ->where('illness', $illness)
            ->delete();

        return response()->json(['message' => 'Malaltia eliminada correctament']);
    }

    // GET /api/xuxedex/owned/{user_id}
    public function ownedXuxemonsByUser($user_id): JsonResponse
    {
        $owned = OwnedXuxemon::where('user_id', $user_id)->with(['xuxemon', 'illnesses'])->get()
        ->map(function ($owned) {
            return [
                'owned_xuxemon_id' => $owned->id,
                'id' => $owned->xuxemon->id,
                'name' => $owned->xuxemon->name,
                'illnesses' => $owned->illnesses->pluck('illness'),
            ];
        });
        return response()->json($owned);
    }
}
