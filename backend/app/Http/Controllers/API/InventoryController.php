<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

use App\Models\Inventory;
use App\Models\Xuxe;
use Illuminate\Http\JsonResponse;
use Tymon\JWTAuth\Facades\JWTAuth;

class InventoryController extends Controller
{
    const MAX_SLOTS = 20;
    const MAX_STACK = 5;

    /* get api/Invenory 
    devuelve todos los slots unicamente del usuario registrado */
    public function index(): JsonResponse
    {
        $user = JWTAuth::parseToken()->authenticate();

        $inventory = Inventory::width('xuxe')->where('user_id', $user->id)->get();

        return response()->json($inventory);
    }

    //POST /API/INVENTORY/ADD
    //el bot añade una cantidad de xuxes a la moxila de un jugador

    public function add(Request $request): JsonResponse
    {
        $user = JWTAuth::parseToken()->authenticate();
        $request->validate([
            'xuxe_id' => 'required|integer|exists:xuxes,id',
            'amount' => 'sometimes|integer|min:1' 
        ]);

        $xuxe = Xuxe::findOrFail($request->xuxe_id);
        $amount = $request->input('amount', 1);
        $added = 0;
        $discarded = 0;

        for($i = 0; $i < $amount; $i++){
            //Hay un slot de la misma xuxe con espacio libre?
            $slot = Inventory::where('user_id', $user->id)->where('xuxe_id', $xuxe->id)->where('quantity', '<', self::MAX_STACK)->first();

            if($slot){
                $slot->increment('quantity');
                $added++;
                continue;
            }

            //NO slot disponible, se necesita uno nuevo

            $usedSlots = Inventory::where('user_id', $user->id)->count();

            if($usedSlots <= self::MAX_SLOTS){
                $discarded++;
                continue;
            }

            Inventory::create([
                'user_id' => $user->id,
                'xuxe_id' => $xuxe->id,
                'quantity' => 1,
            ]);
            $added++;
        }
        return response()-json([
            'added'     => $added,
            'discarded' => $discarded,
            'message'   => $discarded > 0
                ? "Afegits {$added}. Descartats {$discarded} per motxilla plena."
                : "Afegits {$added} correctament.",
        ], 201);
    }

   public function evolve(int $slotId): JsonResponse
    {
        $user = JWTAuth::parseToken()->authenticate();

        $slot = Inventory::with('xuxe')
            ->where('user_id', $user->id)
            ->find($slotId);

        if (!$slot) {
            return response()->json(['error' => 'Slot no trobat.'], 404);
        }

        $nextSize = match($slot->xuxe->size) {
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

        // Restar 3 del slot actual, si llega a 0 borrar la fila
        $slot->quantity -= 3;
        $slot->quantity === 0 ? $slot->delete() : $slot->save();

        // Buscar el xuxe evolucionado: mismo tipo, siguiente tamaño
        $evolvedXuxe = Xuxe::where('type', $slot->xuxe->type)
            ->where('size', $nextSize)
            ->first();

        if (!$evolvedXuxe) {
            return response()->json(['error' => 'No existeix el xuxe evolucionat a la BD.'], 404);
        }

        // Añadir el xuxe evolucionado a la motxilla con la misma lógica de slots
        $slot2 = Inventory::where('user_id', $user->id)
            ->where('xuxe_id', $evolvedXuxe->id)
            ->where('quantity', '<', self::MAX_STACK)
            ->first();

        if ($slot2) {
            $slot2->increment('quantity');
        } else {
            $usedSlots = Inventory::where('user_id', $user->id)->count();
            if ($usedSlots >= self::MAX_SLOTS) {
                return response()->json(['error' => 'Evolució feta però motxilla plena. Xuxe evolucionat descartat.'], 422);
            }
            Inventory::create([
                'user_id'  => $user->id,
                'xuxe_id'  => $evolvedXuxe->id,
                'quantity' => 1,
            ]);
        }

        return response()->json([
            'message'      => 'Evolució completada!',
            'evolved_into' => $evolvedXuxe,
        ]);
    }
}
