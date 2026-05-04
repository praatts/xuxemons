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
    * Mètode API endpoint: Retorna tots els settings existents.
    */
    public function index()
    {
        // Obtenim l'usuari autèntic a través del "guard" api (token passat per header de l'Angular)
        $user = Auth::guard('api')->user();

        // Control de rols: Només els administradors tenen permís a llegir l'arxiu sencer d'aquí. Error 403 (Forbidden) si no passa.
        if (!$user || $user->role !== 'admin') {
            return response()->json(['message' => 'No autorizado'], 403);
        }

        // Si ets admin validat, la crida a Setting::all() recupera tota la taula Settings de la BD i la retorna directament com un JSON formatat.
        return response()->json(Setting::all());
    }

    /**
     * Actualiza un setting específico según su 'key' (API endpoint)
     * Mètode API endpoint per actualitzar iterant les modificacions de forma dinàmica.
     */

    public function update(Request $request)
    {
        // Com en la lectura, obtenim l'usuari de l'Autenticació actualitzada
        $user = Auth::guard('api')->user();

        // Si resulta ser un usuari extern, banneig 403 automàtic per evitar que injectin valors a la bd
        if (!$user || $user->role !== 'admin') {
            return response()->json(['error' => 'No autorizado'], 403);
        }

        // Tota l'estructura de "settings" ve de la taula original directament.
        $settings = Setting::all();

        // Fem un loop de cada paràmetre de configuració que està disponible i configurat actualment
        foreach ($settings as $setting) {
            // Per cada iteració, per exmeple "little_to_mid", la nostra variable local '$value' agafa el que val aquesta "key" en el JSON que ha enviat l'Angular, a través de l'input()
            $value = $request->input($setting->key);

            // Si el Payload d'Angular no porta el valor a canviar, o l'han enviat buit totalment (el que implicaria corrupció a la bd), es salta i deixem intacte aquest registre de la Base de dades
            if ($value === '' || $value == null) {
                continue;
            }

            // Si hi ha dades per actualitzar, simplement les substituïm al objecte del model a memòria
            $setting->value = $value;
            // .save() executa l'UPDATE a la base de dades. Com això està dins d'un forEach, farà UPDATE a tots els camps llistats un per un.
            $setting->save();
        }

        // Finalitzem construint un petit missatge de resolució, incloent l'estat ".fresh()" dels settings, que recarrega l'últim array d'informació net guardat la Base de dades.
        return response()->json([
            'message' => 'Configuraciones actualizada correctamente',
            'updated_setting' => $settings->fresh()
        ]);
    }
}
