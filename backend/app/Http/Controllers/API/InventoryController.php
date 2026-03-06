<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

use App\Models\Inventory;
use App\Models\Xuxemon;
use Illuminate\Http\JsonResponse;
use Tymon\JWTAuth\Facades\JWTAuth;

class InventoryController extends Controller
{
    // NO es necesario MAX_SLOTS ni MAX_STACK porque la tabla user_xuxe no tiene límites
    
    //GESTIONA LA MOXILA

    /* get api/Inventory 
    devuelve todos los xuxes del usuario registrado */
    public function index(): JsonResponse
    {
        $user = JWTAuth::parseToken()->authenticate();

        // Corregido: "width" por "with"
        $inventory = Inventory::with('xuxemon')->where('user_id', $user->id)->get();

        return response()->json($inventory);
    }

    //POST /API/INVENTORY/ADD
    //el bot añade una cantidad de xuxes al inventario de un jugador
    public function add(Request $request): JsonResponse
    {
        $user = JWTAuth::parseToken()->authenticate();
        $request->validate([
            'xuxe_id' => 'required|integer|exists:xuxes,id',
            'amount'  => 'sometimes|integer|min:1' 
        ]);

        $xuxe_id = $request->xuxe_id;
        $amount = $request->input('amount', 1);

        // Buscamos si el usuario ya tiene esta xuxe en su inventario
        $slot = Inventory::where('user_id', $user->id)
                         ->where('xuxe_id', $xuxe_id)
                         ->first();

        // Lógica muy simple con IF: si ya existe le sumamos la cantidad. Si no, lo creamos.
        if ($slot) {
            $slot->increment('quantity', $amount);
        } else {
            Inventory::create([
                'user_id'  => $user->id,
                'xuxe_id'  => $xuxe_id,
                'quantity' => $amount,
            ]);
        }

        return response()->json([
            'message' => "S'han afegit {$amount} xuxes correctament."
        ], 201);
    }

    // POST /api/inventory/{slotId}/evolve
    // Evoluciona 3 xuxes del mismo slot al siguiente tamaño
    public function evolve(int $slotId): JsonResponse
    {
        $user = JWTAuth::parseToken()->authenticate();

        $slot = Inventory::with('xuxemon')
            ->where('user_id', $user->id)
            ->find($slotId);

        if (!$slot) {
            return response()->json(['error' => 'Registro de inventario no trobat.'], 404);
        }

        // Determinar qué tamaño será el siguiente
        $nextSize = match($slot->xuxemon->size) {
            'petit' => 'mitja',
            'mitja' => 'gran',
            default => null,
        };

        if (!$nextSize) {
            return response()->json(['error' => 'Aquest xuxe ja és gran i no pot evolucionar.'], 422);
        }

        if ($slot->quantity < 3) {
            return response()->json(['error' => "Necessites 3 unitats. Tens {$slot->quantity}."], 422);
        }

        // Restar 3 unidades, si llega a 0 borrar la fila del inventario
        $slot->quantity -= 3;
        if ($slot->quantity === 0) {
            $slot->delete();
        } else {
            $slot->save();
        }

        // Buscar el xuxe evolucionado: mismo tipo, siguiente tamaño
        $evolvedXuxemon = Xuxemon::where('type', $slot->xuxemon->type)
            ->where('size', $nextSize)
            ->first();

        if (!$evolvedXuxemon) {
            return response()->json(['error' => 'No existeix el xuxemon evolucionat a la BD.'], 404);
        }

        // Añadir el xuxemon evolucionado al inventario de forma sencilla
        $slotEvolucionado = Inventory::where('user_id', $user->id)
            ->where('xuxe_id', $evolvedXuxemon->id)
            ->first();

        if ($slotEvolucionado) {
            $slotEvolucionado->increment('quantity');
        } else {
            Inventory::create([
                'user_id'  => $user->id,
                'xuxe_id'  => $evolvedXuxemon->id,
                'quantity' => 1,
            ]);
        }

        return response()->json([
            'message'      => 'Evolució completada!',
            'evolved_into' => $evolvedXuxemon,
        ]);
    }
}
