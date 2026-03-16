<?php

namespace App\Http\Controllers;

use App\Models\Xuxemon;
use Illuminate\Http\Request;

class XuxemonsController extends Controller
{
    public function giveXuxe($id){
        $xuxemon = Xuxemon::findOrFail($id);

        //sumar xuxe
        $xuxemon->xuxes++;

        //reglas de evolución
        if ($xuxemon->size === 'petit' && $xuxemon->xuxes >= 3) {
            $xuxemon->size = 'mitja';
            $xuxemon->xuxes = 0;
        }

        if ($xuxemon->size === 'mitja' && $xuxemon->xuxes >= 5) {
            $xuxemon->size = 'gran';
            $xuxemon->xuxes = 0;
        }

        $xuxemon->save();
        return response()->json($xuxemon);
    }
}
