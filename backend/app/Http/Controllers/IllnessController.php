<?php

namespace App\Http\Controllers;

use App\Models\Illness;
use Auth;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class IllnessController extends Controller
{
    public function index(): JsonResponse
    {
        $user = Auth::guard('api')->user();

        if (!$user || $user->role !== 'admin') {
            return response()->json(['error' => 'No autorizado'], 403);
        }

        return response()->json(Illness::all());
    }

    public function update(Request $request): JsonResponse
    {
        $user = Auth::guard('api')->user();

        if (!$user || $user->role !== 'admin') {
            return response()->json(['error' => 'No autorizado'], 403);
        }

        $illnesses = Illness::all();

        foreach ($illnesses as $illness) {
            $value = $request->input($illness->key);
            if ($value === '' || $value === null) {
                continue;
            }

            $illness->infection_percentage = $value;
            $illness->save();
        }

        return response()->json([
            'message' => 'Percentatges actualitzats correctament',
            'illnesses' => $illnesses->fresh()
        ]);
    }
}
