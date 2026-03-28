<?php

namespace App\Http\Controllers;

use App\Models\Illness;
use App\Models\OwnedXuxemonIllness;
use App\Models\Setting;
use Exception;
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
    public function giveXuxe(Request $request, $owned_id)
    {
        try {
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
            $item = Item::where('name', $map[$request->type])->first();

            if (!$item) {
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

            $owned = OwnedXuxemon::where('id', $owned_id)
                ->where('user_id', $user->id)
                ->with('illnesses')
                ->firstOrFail();

            if ($owned->size === 'gran') {
                return response()->json([
                    'message' => 'Aquest xuxemon ja es massa gran, no es pot alimentar'
                ], 400);
            }

            //Comprobar si el xuxemon tiene Atracón
            $hasAtracon = $owned->illnesses->contains('name', 'Atracón');

            if ($hasAtracon) {
                return response()->json(['message' => 'Aquest Xuxemon té Atracón i no pot menjar'], 400);
            }

            //Restar al inventario y sumar progreso
            $inventory->quantity -= 1;
            $inventory->save();

            $owned->number_xuxes += 1;

            $littleToMid = (int) Setting::where('key', 'little_to_mid')->value('value');
            $midToBig = (int) Setting::where('key', 'mid_to_big')->value('value');

            $hasBajon = $owned->illnesses->contains('name', 'Bajón de azúcar');

            if ($hasBajon) {
                $littleToMid += 2;
                $midToBig += 2;
            }

            //Evolución del Xuxemon
            if ($owned->size === 'petit' && $owned->number_xuxes >= $littleToMid) {
                $owned->size = 'mitja';
                $owned->number_xuxes -= $littleToMid;
            } elseif ($owned->size === 'mitja' && $owned->number_xuxes >= $midToBig) {
                $owned->size = 'gran';
                $owned->number_xuxes -= $midToBig;
            }

            $owned->save();

            //Sistema de infección

            $illnesses = Illness::all();
            $newIllnesses = [];

            foreach ($illnesses as $i) {
                $exist = $owned->illnesses->contains('id', $i->id);
                $infection_chance = rand(1, 100);

                if ($exist) {
                    $newIllnesses[] = "{$i->name}: ja té aquesta malaltia";
                } elseif ($infection_chance <= $i->infection_percentage) {
                    $owned->illnesses()->attach($i->id);
                    $newIllnesses[] = "{$i->name}: infectat! (tret: {$infection_chance}%)";
                    break;
                } else {
                    $newIllnesses[] = "{$i->name}: no infectat (tret: {$infection_chance}%)";
                }
            }

            return response()->json([
                'xuxes' => $owned->number_xuxes,
                'size' => $owned->size,
                'new_illnesses' => $newIllnesses,
                'illnesses' => $owned->fresh()->load('illnesses')->illnesses

            ]);
        } catch (Exception $e) {
            return response()->json([
                'error' => $e->getMessage(),
                'line' => $e->getLine()
            ], 500);
        }
    }

    public function giveVaccine(Request $request, $owned_id)
    {

        try {
            $user = Auth::guard('api')->user();

            $request->validate([
                'item_id' => 'required|integer|exists:items,id'
            ]);

            $item = Item::findOrFail($request->item_id);

            if ($item->stackable) {
                return response()->json([
                    'message' => 'Aquest item no és una vacuna'
                ], 400);
            }

            $inventory = Inventory::where('user_id', $user->id)
                ->where('item_id', $item->id)
                ->first();

            if (!$inventory || $inventory->quantity <= 0) {
                return response()->json(['message' => 'No tens aquesta vacuna'], 400);
            }

            $owned = OwnedXuxemon::where('id', $owned_id)
                ->where('user_id', $user->id)
                ->with('illnesses')
                ->first();

            if (!$owned) {
                return response()->json(['message' => "Xuxemon no trobat"], 404);
            }

            if ($owned->illnesses->isEmpty()) {
                return response()->json([
                    'message' => 'Aquest xuxemon no té cap malaltia'
                ], 400);
            }

            if ($item->illness_id == null) {
                $owned->illnesses()->detach();
                $cured = 'S\'han curat totes les enfermetats';
            } else {
                $illness = $owned->illnesses->where('id', $item->illness_id)->first();

                if (!$illness) {
                    return response()->json([
                        'message' => 'Aquest xuxemon no té la malaltia que cura aquesta vacuna'
                    ], 400);
                }

                $owned->illnesses()->detach($item->illness_id);
                $cured = 'S\'ha curat la enfermetat:' . $illness->name;
            }

            $inventory->delete();

            return response()->json([
                'message' => 'Vacuna aplicada correctament',
                'cured' => $cured,
                'illnesses' => $owned->fresh()->load('illnesses')->illnesses
            ]);
        } catch (Exception $e) {
            return response()->json([
                'error' => $e->getMessage(),
                'line' => $e->getLine(),
            ]);
        }
    }
}
