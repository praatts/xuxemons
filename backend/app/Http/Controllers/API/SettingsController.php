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

    public function update(Request $request)
    {
        $user = Auth::guard('api')->user();

        if (!$user || $user->role !== 'admin') {
            return response()->json(['error' => 'No autorizado'], 403);
        }

        $settings = Setting::all();

        foreach ($settings as $setting) {
            $value = $request->input($setting->key);

            if ($value === '' || $value == null) {
                continue;
            }

            $setting->value = $value;
            $setting->save();
        }

        return response()->json([
            'message' => 'Configuraciones actualizada correctamente',
            'updated_setting' => $settings->fresh()
        ]);
    }
}
