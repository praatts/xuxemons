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
        //Obtenim l'id del jugador autenticat i l'id del jugador dos des de la petició
        $p1_id = Auth::guard('api')->id();
        $p2_id = (int) $request->player_two_id;

        //Comprovem si el jugador autenticat es vàlid
        if (!$p1_id) {
            return response()->json(['error' => 'No autoritzat'], 401);
        }

        //Comprovem que el jugador dos és vàlid i que no és el mateix que el jugador 1
        if (!$p2_id || $p1_id === $p2_id) {
            return response()->json(['error' => 'Jugador invàlid'], 400);
        }

        //Carreguem el xuxemon seleccionat pel jugador
        $xuxemon_p1 = OwnedXuxemon::where('user_id', $p1_id)->inRandomOrder()->first();
        $xuxemon_p2 = OwnedXuxemon::where('user_id', $p2_id)->inRandomOrder()->first();

        //Comprovem que els 2 jugadors han seleccionat un xuxemon
        if (!$xuxemon_p1 || !$xuxemon_p2) {
            return response()->json(['error' => 'No hi ha xuxemons disponibles per iniciar la batalla'], 400);
        }

        //Creem la petició de batalla
        $battle = Battle::create([
            'player_one_id' => $p1_id,
            'player_two_id' => $p2_id,
            'xuxemon_player_one_id' => $xuxemon_p1->id,
            'xuxemon_player_two_id' => $xuxemon_p2->id,
            'status' => 'pending'
        ]);

        return response()->json(
            $battle->load(['playerOne', 'playerTwo', 'xuxemonOne', 'xuxemonTwo', 'winner'])
        );
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
        } elseif ($score_p2 > $score_p1) {
            $winner_id = $battle->player_two_id;
        } else {
            $winner_id = -1; //Empat, no hi ha guanyador
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
        if ($winner_id === -1) {
            return response()->json(['error' => 'Empat, no hi ha guanyador'], 201);
        }

        //El usuari guanyador roba el xuxemon perdedor (actualitzem el propietari del Xuxemon perdedor al guanyador)
        if ($winner_id === $battle->player_one_id) {
            $loserXuxemon = $xuxemonTwo;
        } else {
            $loserXuxemon = $xuxemonOne;
        }
        
        //Actualitzem el propietari del Xuxemon perdedor al guanyador
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
            'aire' => 'tierra',
            'aigua' => 'aire',
            'tierra' => 'aigua',
        ];
        //Retorna true si el tipus 1 té avantatge sobre el tipus 2 Ex: 'tierra' => 'aire
        return isset($advantages[$type1]) && $advantages[$type1] === $type2;
    }
}
