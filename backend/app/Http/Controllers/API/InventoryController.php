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

    /* get api/Invenory | devuelve todos los slots unicamente del usuario registrado */
    public function index(): JsonResponse
    {
        $user = JWTAuth::parseToken()->authenticate();

        $inventory = Inventory::width('xuxe')->where('user_id', $user->id)->get();

        return response()->json($inventory);
    }
}
