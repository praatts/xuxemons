<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

use App\Models\User;
use App\Models\Item;
use App\Models\Inventory;
<<<<<<< HEAD
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
=======



class InventoryController extends Controller
{
    public function addXuxes(Request $request, User $user)
>>>>>>> 34efa8466655cb151f8f37b3bf4f73dd981bcc35
    {

<<<<<<< HEAD
        // Corregido: "width" por "with"
        $inventory = Inventory::with('xuxemon')->where('user_id', $user->id)->get();
=======
        //Validación de que existe el objeto antes de darselo al usuario.
>>>>>>> 34efa8466655cb151f8f37b3bf4f73dd981bcc35

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

        if ($availableSlots == 0) {
            return response()->json([
                'error' => 'El inventario del usuario está lleno, no se ha podido añadir los items al inventario',
            ], 404);
        }

        if ($finalQuantity > 0) {
            $slot = Inventory::firstOrNew([
                'user_id' => $user->id,
                'item_id' => $item->id,
            ]);

<<<<<<< HEAD
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
=======
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
>>>>>>> 34efa8466655cb151f8f37b3bf4f73dd981bcc35
        ]);
    }

    //Devuelve el inventario del usuario autenticado

    public function getUserInventory() {
        $user = auth()->user();
        return response()->json($user->inventory);
    }
}
