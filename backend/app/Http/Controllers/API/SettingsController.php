<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\Setting;

class SettingsController extends Controller
{
    /*
    * Devuelve todos los settings registrados (API endpoint)
    */
    public function index()
    {
        $user = Auth::guard('api')->user();

        if (!$user || $user->role !== 'admin') {
            return response()->json(['message' => 'No autorizado'], 403);
        }

        return response()->json(Setting::all());
    }

    /**
     * Actualiza un setting específico según su 'key' (API endpoint)
     */

    public function update(Request $request, $key)
    {
        $user = Auth::guard('api')->user();

        if (!$user || $user->role !== 'admin') {
            return response()->json(['error' => 'No autorizado'], 403);
        }

        $request->validate([
            'value' => 'required',
        ]);

        $setting = Setting::where('key', $key)->first();

        if (!$setting) {
            return response()->json(
                ['error' => 'No existe ninguna configuracion con esta clave'],
                404
            );
        }

        $setting->value = $request->input('value');
        $setting->save();

        return response()->json([
            'message' => 'Configuración actualizada correctamente',
            'updated_setting' => $setting
        ]);
    }
}
