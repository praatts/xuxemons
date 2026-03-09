<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

use App\Models\User;
use App\Models\Item;
use App\Models\Inventory;



class InventoryController extends Controller
{
    public function addXuxes(Request $request, User $user)
    {

        //Validación de que existe el objeto antes de darselo al usuario.

        $request->validate([
            'item_id' => 'required|integer|exists:items,id',
            'quantity' => 'sometimes|integer|min:1'
        ]);


        //Búsqueda de las xuxes en la base de datos
        $item = Item::findOrFail($request->item_id);
        $quantity = $request->input('quantity', 1);


        //Error si se intenta dar una vacuna
        if (!$item->stackable) {
            return response()->json([
                'error' => 'Objeto no apilable'
            ], 403);
        }

        $availableSlots = $user->getAvailableSlots();
        $maxQuantity = $availableSlots * $item->max_capacity;
        $finalQuantity = min($quantity, $maxQuantity);

        if ($finalQuantity > 0) {
            $slot = Inventory::firstOrNew([
                'user_id' => $user->id,
                'item_id' => $item->id,
            ]);

            $slot->quantity += $finalQuantity;
            $slot->save();
        }
        return response()->json([
            'message' => "Se han añadido {$finalQuantity} correctamente",
            'added' => $finalQuantity,
        ]);
    }

    //Devuelve todos los jugadores para añadir xuxes (no admins)

    public function index()
    {
        $users = User::where('role', 'user')->get();

        if ($users->isEmpty()) {
            return response()->json([
                'error' => 'No hay jugadores registrados.'
            ], 404);
        }
        return response()->json($users);
    }

    //Devuelve el número de slots disponibles (testing)

    public function getAvailableSlots(User $user)
    {
        return response()->json([
            'available_slots' => $user->getAvailableSlots()
        ]);
    }
}
