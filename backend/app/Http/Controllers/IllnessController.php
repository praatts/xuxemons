<?php

namespace App\Http\Controllers;

use App\Models\Illness;
use Auth;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class IllnessController extends Controller
{
    public function index() : JsonResponse {
        $user = Auth::guard('api')->user();

        if (!$user || $user->role !== 'admin') {
            return response()->json(['error' => 'No autorizado'], 403);
        }

        return response()->json(Illness::all());
    }

    public function update(Request $request, $id) : JsonResponse {
        $user = Auth::guard('api')->user();

        if (!$user || $user->role !== 'admin') {
            return response()->json(['error' => 'No autorizado'], 403);
        }

        $request->validate([
            'percentage' => 'required|integer|min:0|max:100'
            ]);

        $illness = Illness::find($id);

        if (!$illness) {
            return response()->json(['error'=> 'Enfermedad no encontrada'],404);
        }

        $old_percentage = $illness->infection_percentage;

        $illness->infection_percentage = $request->percentage;
        $new_percentage = $request->percentage;
        $illness->save();

        return response()->json([
            'message' => "Percentatge de {$illness->name} actualitzat correctament",
            'change' => "{$old_percentage}% ha canviat a {$new_percentage}%",
        ]);


    }

}
