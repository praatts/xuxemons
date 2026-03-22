<?php

namespace App\Http\Controllers;

use App\Models\Setting;
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
                'message' => 'Tipus de xuxe no vàlida'
            ], 400);
        }

        //Buscar item

        $item = Item::where('name' , $map[$request->type])->first();

        if(!$item){
            return response()->json([
                'message' => 'Item no trobat'
            ], 404);
        }

        $inventory = Inventory::where('user_id', $user->id)->where('item_id', $item->id)->first();

        if (!$inventory || $inventory->quantity <= 0) {
            return response()->json([
                'message' => "No tens ninguna {$map[$request->type]}"
            ], 400);
        }

        $owned = OwnedXuxemon::where('id', $ownedId)->where('user_id', $user->id)->firstOrFail();

        //restar del inventario
        $inventory->quantity -= 1;
        $inventory->save();

        //sumar progreso
        $owned->number_xuxes += 1;

        $littleToMid = (int) Setting::where('key','little_to_mid')->value('value');
        $midToBig = (int) Setting::where('key','mid_to_big')->value('value');

        //evolución
        if ($owned->size === 'petit' && $owned->number_xuxes >= $littleToMid) {
            $owned->size = 'mitja';
            $owned->number_xuxes -= $littleToMid;
        } elseif ($owned->size === 'mitja' && $owned->number_xuxes >= $midToBig) {
            $owned->size = 'gran';
            $owned->number_xuxes -= $midToBig;
        }

        $owned->save();

        return response()->json([
            'xuxes' => $owned->number_xuxes,
            'size' => $owned->size
        ]);
    }
}
