<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use App\Models\User;
use App\Models\Item;
use App\Models\Inventory;
use App\Models\Xuxemon;


class InventoryController extends Controller
{
    //Retorna l'inventari de l'usuari autenticat
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

    //Mètode per afegir un item a l'inventari d'un usuari (només admins)
    public function addItem(Request $request, User $user)
    {

    try {

        $authUser = Auth::guard('api')->user();

        if (!$authUser || $authUser->role !== 'admin') {
            return response()->json(['error' => 'No autoritzat'], 403);
        }

        //Valida les dades de la petició

        $request->validate([
            'item_id' => 'required|integer|exists:items,id',
            'quantity' => 'sometimes|integer|min:1'
        ]);

        //Obteneix l'item i la quantitat a afegir
        $item = Item::findOrFail($request->item_id);
        $quantity = $request->input('quantity', 1);
        $availableSlots = $user->getAvailableSlots(); //Comprova que l'usuari té slots disponibles al inventari (max 20)

        //Retorna error si no hi ha slots disponibles
        if ($availableSlots == 0) {
            return response()->json([
                'error' => 'El inventario del usuario está lleno',
            ], 403);
        }

        //Si el item es apilable, intenta apilar-lo, en cas de no poder, crea un slot nou
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

            //Si no s'han pogut afegir tots els items, retorna un missatge indicant quants s'han afegit i quants no
            if ($finalQuantity < $quantity) {
                return response()->json([
                    'message' => "Només s'han pogut afegir {$finalQuantity} items, els {$remaining} restants no s'han afegit per falta de slots disponibles",
                    'added' => $finalQuantity,
                ]);
            }

            //Si s'han pogut afegir tots els items, retorna un missatge indicant quants s'han afegit
            return response()->json([
                'message' => "S'han afegit {$finalQuantity} correctament",
                'added' => $finalQuantity,
            ]);
        } else {
            //Si la quantitat a afegir és superior als slots disponibles (quan l'item no es apilable), retorna un error indicant quants slots hi ha disponibles
            if ($availableSlots < $quantity) {
                return response()->json([
                    'error' => "Només hi ha {$availableSlots} slots disponibles",
                ], 403);
            }

            //Si el item no es apilable, crea un slot nou per cada unitat a afegir
            for ($i = 0; $i < $quantity; $i++) {
                Inventory::create([
                    'user_id' => $user->id,
                    'item_id' => $item->id,
                    'quantity' => 1,
                ]);
            }

            //Retorna un missatge indicant quants items s'han afegit
            return response()->json([
                'message' => "S'han afegit {$quantity} correctament",
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
