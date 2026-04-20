<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Battle;
use App\Models\OwnedXuxemon;
use Auth;
class BatllesController extends Controller
{
    function index() {
            $battles = Battle::with(['playerOne', 'playerTwo', 'xuxemonOne', 'xuxemonTwo', 'winner'])->get();
            return response()->json($battles);
    }

    function store(Request $request) {
        $battle = Battle::create([
            'player_one_id' => Auth::guard('api')->id(),
            'player_two_id' => $request->player_two_id,
            'xuxemon_player_one_id' => $request->xuxemon_player_one_id,
            'xuxemon_player_two_id' => $request->xuxemon_player_two_id,
            'status' => 'pending'
        ]);
        return response()->json($battle);
    }

    
}
