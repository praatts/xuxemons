<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Auth;
use Tymon\JWTAuth\Facades\JWTAuth;
use App\Http\Controllers\API\inventoryController;
use App\Http\Controllers\UserController;

use App\Models\Xuxemon;
use App\Models\Item;
use App\Models\Inventory;
use App\Models\OwnedXuxemon;
use Illuminate\Http\Request;

class XuxemonsController extends Controller
{
    public function giveXuxe(Request $request, $ownedId){
        $request->validate([
            'type' => 'required|string'
        ]);

        $user = Auth::guard('api')->user();

        //obtener tipos
        $map = [
            'verda' => 'Xuxe verda',
            'blava' => 'Xuxe blava',
            'vermella' => 'Xuxe vermella'  
        ];

        if (!isset($map[$request->type])) {
            return response()->json([
                'message' => 'Tipus de xuxe no vàlid'
            ], 400);
        }

        $itemName = $map[$request->type];

        //buscar item
        $item = Item::where('name', $itemName)->first();

        if(!$item){
            return response()->json([
                'message' => 'Item no trobat'
            ], 400);
        }

        //inventario
        $inventory = Inventory::where('user_id', $user->id)->where('item_id', $item->id)->first();

        if (!$inventory || $inventory->quantity <= 0) {
            return response()->json([
                'message' => "No tens $itemName"
            ], 400);
        }

        //xuxemon del user
        $owned = OwnedXuxemon::where('id', $ownedId)->where('user_id', $user->id)->firstOrFail();

        //restar del inventario
        $inventory->quantity -= 1;
        $inventory->save();

        //sumar progreso
        $owned->number_xuxes += 1;

        //evolución
        if ($owned->size === 'petit' && $owned->number_xuxes >= 3) {
            $owned->size = 'mitja';
            $owned->number_xuxes -= 3;
        } elseif ($owned->size === 'mitja' && $owned->number_xuxes >= 5) {
            $owned->size = 'gran';
            $owned->number_xuxes -= 5;
        }

        $owned->save();
        return response()->json([
            'xuxes' => $owned->number_xuxes,
            'size' => $owned->size
        ]);
    }
}
