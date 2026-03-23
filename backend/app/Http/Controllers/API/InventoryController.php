<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;

use App\Models\User;
use App\Models\Item;
use App\Models\Inventory;
use App\Models\Xuxemon;


class InventoryController extends Controller
{
    /**
     * get api/inventory 
     * devuelve el inventario del usuario autenticado
     */
    public function index(): JsonResponse
    {
        try {
            $user = Auth::guard('api')->user();
            if (!$user) {
                return response()->json(['error' => 'User not found'], 404);
            }

            $inventory = Inventory::with(['xuxemon', 'item'])
                ->where('user_id', $user->id)
                ->get();

            return response()->json($inventory);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to fetch inventory'], 500);
        }
    }

    /**
     * POST /api/inventory/add-item/{user_id}
     * Añade objetos al inventario de un usuario
     */
    public function addItem(Request $request, User $user)
    {

    try {

        $authUser = Auth::guard('api')->user();

        if (!$authUser || $authUser->role !== 'admin') {
            return response()->json(['error' => 'No autorizado'], 403);
        }

        $request->validate([
            'item_id' => 'required|integer|exists:items,id',
            'quantity' => 'sometimes|integer|min:1'
        ]);

        $item = Item::findOrFail($request->item_id);
        $quantity = $request->input('quantity', 1);
        $availableSlots = $user->getAvailableSlots();

        if ($availableSlots == 0) {
            return response()->json([
                'error' => 'El inventario del usuario está lleno',
            ], 403);
        }

        if ($item->stackable) {
            $maxQuantity = $availableSlots * $item->max_capacity;
            $finalQuantity = min($quantity, $maxQuantity);
            $remaining = $quantity - $finalQuantity;

            $slot = Inventory::firstOrNew([
                'user_id' => $user->id,
                'item_id' => $item->id,
            ]);

            $slot->quantity += $finalQuantity;
            $slot->save();

            if ($finalQuantity < $quantity) {
                return response()->json([
                    'message' => "Solo se han podido añadir {$finalQuantity} items, los {$remaining} restantes no se han añadido",
                    'added' => $finalQuantity,
                ]);
            }

            return response()->json([
                'message' => "Se han añadido {$finalQuantity} correctamente",
                'added' => $finalQuantity,
            ]);
        } else {
            if ($availableSlots < $quantity) {
                return response()->json([
                    'error' => "Solo hay {$availableSlots} slots disponibles",
                ], 403);
            }

            for ($i = 0; $i < $quantity; $i++) {
                Inventory::create([
                    'user_id' => $user->id,
                    'item_id' => $item->id,
                    'quantity' => 1,
                ]);
            }

            return response()->json([
                'message' => "Se han añadido {$quantity} correctamente",
                'added' => $quantity,
            ]);
        }
    } catch (Exception $e) {
        return response()->json([
            'error'=> $e->getMessage(),
            ],500);
    }

    }

    /**
     * POST /api/inventory/{slotId}/evolve
     * Evoluciona 3 xuxes del mismo slot al siguiente tamaño
     */
    public function evolve(int $slotId): JsonResponse
    {
        $user = Auth::guard('api')->user();

        $slot = Inventory::with('xuxemon')
            ->where('user_id', $user->id)
            ->find($slotId);

        if (!$slot || !$slot->xuxemon) {
            return response()->json(['error' => 'Registro de inventario o xuxemon no trobat.'], 404);
        }

        $nextSize = match ($slot->xuxemon->size) {
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

        $slot->quantity -= 3;
        if ($slot->quantity === 0) {
            $slot->delete();
        } else {
            $slot->save();
        }

        $evolvedXuxemon = Xuxemon::where('type', $slot->xuxemon->type)
            ->where('size', $nextSize)
            ->first();

        if (!$evolvedXuxemon) {
            return response()->json(['error' => 'No existeix el xuxemon evolucionat a la BD.'], 404);
        }

        $slotEvolucionado = Inventory::where('user_id', $user->id)
            ->where('xuxe_id', $evolvedXuxemon->id)
            ->first();

        if ($slotEvolucionado) {
            $slotEvolucionado->increment('quantity');
        } else {
            Inventory::create([
                'user_id' => $user->id,
                'xuxe_id' => $evolvedXuxemon->id,
                'quantity' => 1,
            ]);
        }

        return response()->json([
            'message' => 'Evolució completada!',
            'evolved_into' => $evolvedXuxemon,
        ]);
    }

    /**
     * GET /api/inventory/users
     * Devuelve todos los jugadores para añadir xuxes (no admins)
     */
    public function listUsers()
    {
        $users = User::where('role', 'user')->where('status', 1)->get();

        if ($users->isEmpty()) {
            return response()->json([
                'error' => 'No hay jugadores registrados.'
            ], 404);
        }
        return response()->json($users);
    }

    /**
     * GET /api/inventory/slots/{user}
     * Devuelve el número de slots disponibles
     */
    public function getAvailableSlots(User $user)
    {
        return response()->json([
            'available_slots' => $user->getAvailableSlots()
        ]);
    }

    //Devuelve el inventario del usuario autenticado

    public function getUserInventory()
    {
        $user = auth()->user();
        return response()->json($user->inventory);
    }

    // Devuelve todos los items disponibles en la base de datos

    public function getAllItems()
    {

        $user = auth()->user();

        if (!$user) {
            return response()->json(['error' => 'Usuario no autenticado'], 401);
        }

        if ($user->role !== 'admin') {
            return response()->json(['error' => 'No autorizado'], 403);
        }

        $items = Item::all();
        return response()->json($items);
    }
}
