<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Battle;
use App\Models\OwnedXuxemon;
use Auth;
class BattlesController extends Controller
{
    public function index()
    {
        $user = Auth::guard('api')->user();

        if (!$user) {
            return response()->json(['error' => 'No autoritzat'], 401);
        }

        $battles = Battle::with([
            'playerOne',
            'playerTwo',
            'xuxemonOne',
            'xuxemonTwo',
            'winner'
        ])
            ->where(function ($query) use ($user) {
                $query->where('player_one_id', $user->id)
                    ->orWhere('player_two_id', $user->id);
            })
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($battles);
    }

    public function store(Request $request)
    {
        $battle = Battle::create([
            'player_one_id' => Auth::guard('api')->id(),
            'player_two_id' => $request->player_two_id,
            'xuxemon_player_one_id' => $request->xuxemon_player_one_id,
            'xuxemon_player_two_id' => $request->xuxemon_player_two_id,
            'status' => 'pending'
        ]);
        return response()->json($battle);
    }

    //Mètode per acceptar una batalla pendent (canvia l'estat de la batalla a "accepted" i permet iniciar la batalla)
    public function acceptBattle($id) {
        $user = Auth::guard('api')->user();

        //Comprovem que l'usuari està autenticat i que és el jugador dos de la batalla que vol acceptar, i que la batalla està pendent
        if (!$user) {
            return response()->json(['error' => 'No autoritzat'], 401);
        }
        $battle = Battle::find($id);

        //Retorna error si no s'ha trobat la batalla
        if (!$battle) {
            return response()->json(['error' => 'No s\'ha trobat la batalla'], 404);
        }

        //Comprovem que l'usuari autenticat és el jugador dos de la batalla (el invitat)
        if ($battle->player_two_id !== $user->id) {
            return response()->json(['error' => 'No tens permís per acceptar aquesta batalla'], 403);
        }

        //Comprovem que la batalla està pendent (no s'ha acceptat ni completat encara)
        if ($battle->status !== 'pending') {
            return response()->json(['error' => 'La batalla ja ha estat acceptada o completada'], 400);
        }

        //Actualitzem l'estat de la batalla a "accepted" per permetre iniciar la batalla
        $battle->status = 'accepted';
        $battle->save();

        return response()->json($battle);
    }

    public function fight($id)
    {
        //Carreguem la batalla amb els Xuxemons associats segons la id de la batalla
        $battle = Battle::with(['xuxemonOne', 'xuxemonTwo'])->find($id);

        //Retorna error si no s'ha trobat la batalla
        if (!$battle) {
            return response()->json(['error' => 'No s\'ha trobat la batalla'], 404);
        }

        if ($battle->status !== 'accepted') {
            return response()->json(['error' => 'La batalla ja ha començat o s\'ha completat'], 400);
        }

        //Marquem la batalla com a "in_progress" per evitar que es pugui iniciar més d'una vegada
        $battle->status = 'in_progress';
        $battle->save();

        //Obtenim els Xuxemons dels jugadors
        $xuxemonOne = $battle->xuxemonOne;
        $xuxemonTwo = $battle->xuxemonTwo;

        // Simulem el llançament dels daus
        $dice_p1 = rand(1, 6);
        $dice_p2 = rand(1, 6);

        //Calculem modificadors segons avantatges de tipus i mida
        $modifier_p1 = $this->calculateModifier($xuxemonOne, $xuxemonTwo);
        $modifier_p2 = $this->calculateModifier($xuxemonTwo, $xuxemonOne);

        // Calculem el resultat final sumant el dau i el modificador
        $score_p1 = $dice_p1 + $modifier_p1;
        $score_p2 = $dice_p2 + $modifier_p2;

        $winner_id = null;

        //Declarem el guanyador segons el resultat final (sumació de dau i modificador)
        if ($score_p1 > $score_p2) {
            $winner_id = $battle->player_one_id;
        } else {
            $winner_id = $battle->player_two_id;
        }

        //Actualitzem la batalla amb els resultats i el guanyador
        $battle->update([
            'dice_player_one' => $dice_p1,
            'dice_player_two' => $dice_p2,
            'modifier_player_one' => $modifier_p1,
            'modifier_player_two' => $modifier_p2,
            'winner_id' => $winner_id,
            'status' => 'completed'
        ]);

        //Lançem error si no s'ha pogut determinar el guanyador (en cas d'empat, per exemple)
        if (!$winner_id) {
            return response()->json(['error' => 'Error al determinar el guanyador'], 500);
        }

        //El usuari guanyador roba el xuxemon perdedor (actualitzem el propietari del Xuxemon perdedor al guanyador)
        $loserXuxemon = $winner_id === $battle->player_one_id ? $xuxemonTwo : $xuxemonOne;
        $loserXuxemon->owner_id = $winner_id;
        $loserXuxemon->save();

        //Retornem la batalla actualitzada amb els resultats i el guanyador
        return response()->json($battle->fresh());

    }

    //Mètode per calcular el modificador de cada jugador segons els avantatges de tipus i mida dels seus Xuxemons
    private function calculateModifier($xuxemon, $opponent)
    {
        $modifier = 0;

        //Comprovem avantatges/desavantatges de tipus
        if ($this->hasAdvantage($xuxemon->type, $opponent->type)) {
            $modifier += 1;
        } elseif ($this->hasAdvantage($opponent->type, $xuxemon->type)) {
            $modifier -= 1;
        }

        //Avantatge de mida (mitja/gran, ignorem el petit)
        switch ($xuxemon->size) {
            case 'mitja':
                $modifier += 1;
                break;
            case 'gran':
                $modifier += 2;
                break;
        }
        return $modifier;
    }

    //Comprovem si el tipus del primer Xuxemon té avantatge sobre el segon
    private function hasAdvantage($type1, $type2)
    {
        //Map [element => element amb avantatge sobre ell]
        $advantages = [
            'tierra' => 'aire',
            'aire' => 'agua',
            'agua' => 'tierra',
        ];
        //Retorna true si el tipus 1 té avantatge sobre el tipus 2 Ex: 'tierra' => 'aire
        return isset($advantages[$type1]) && $advantages[$type1] === $type2;
    }
}
