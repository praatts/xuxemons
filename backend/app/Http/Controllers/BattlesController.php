<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Battle;
use App\Models\OwnedXuxemon;
use App\Events\BattleUpdated;
use Auth;
class BattlesController extends Controller
{
    //Mètode per obtenir totes les batalles de l'usuari autenticat (com a jugador 1 o jugador 2)
    public function index()
    {
        $user = Auth::guard('api')->user();

        if (!$user) {
            return response()->json(['error' => 'No autoritzat'], 401);
        }

        //Carreguem les batalles amb les relacions dels jugadors, xuxemons (amb el seu tipus base) i guanyador
        $battles = Battle::with([
            'playerOne',
            'playerTwo',
            'xuxemonOne.xuxemon',
            'xuxemonTwo.xuxemon',
            'winner'
        ])
            ->where(function ($query) use ($user) {
                $query->where('player_one_id', $user->id)
                    ->orWhere('player_two_id', $user->id);
            })
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($battle) {
                //Afegim el nom i tipus del xuxemon base a la resposta per facilitar el frontend
                $data = $battle->toArray();
                if ($battle->xuxemonOne && $battle->xuxemonOne->xuxemon) {
                    $data['xuxemon_one_name'] = $battle->xuxemonOne->xuxemon->name;
                    $data['xuxemon_one_type'] = $battle->xuxemonOne->xuxemon->type;
                    $data['xuxemon_one_size'] = $battle->xuxemonOne->size;
                }
                if ($battle->xuxemonTwo && $battle->xuxemonTwo->xuxemon) {
                    $data['xuxemon_two_name'] = $battle->xuxemonTwo->xuxemon->name;
                    $data['xuxemon_two_type'] = $battle->xuxemonTwo->xuxemon->type;
                    $data['xuxemon_two_size'] = $battle->xuxemonTwo->size;
                }
                return $data;
            });

        return response()->json($battles);
    }

    //Mètode per crear una sol·licitud de batalla a un amic (des de la pàgina d'amics)
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

        //Carreguem un xuxemon aleatori per cada jugador com a selecció inicial
        $xuxemon_p1 = OwnedXuxemon::where('user_id', $p1_id)->inRandomOrder()->first();
        $xuxemon_p2 = OwnedXuxemon::where('user_id', $p2_id)->inRandomOrder()->first();

        //Comprovem que els 2 jugadors tenen com a mínim un xuxemon disponible
        if (!$xuxemon_p1 || !$xuxemon_p2) {
            return response()->json(['error' => 'No hi ha xuxemons disponibles per iniciar la batalla'], 400);
        }

        //Creem la petició de batalla amb xuxemons aleatoris inicials (es podran canviar després)
        $battle = Battle::create([
            'player_one_id' => $p1_id,
            'player_two_id' => $p2_id,
            'xuxemon_player_one_id' => $xuxemon_p1->id,
            'xuxemon_player_two_id' => $xuxemon_p2->id,
            'status' => 'pending',
            'player_one_ready' => false,
            'player_two_ready' => false
        ]);

        return response()->json(
            $battle->load(['playerOne', 'playerTwo', 'xuxemonOne.xuxemon', 'xuxemonTwo.xuxemon', 'winner'])
        );
    }

    //Mètode per acceptar una batalla pendent (canvia l'estat de la batalla a "accepted" i permet entrar a la pàgina de batalla)
    public function acceptBattle($id) {
        $user = Auth::guard('api')->user();

        if (!$user) {
            return response()->json(['error' => 'No autoritzat'], 401);
        }
        $battle = Battle::find($id);

        if (!$battle) {
            return response()->json(['error' => 'No s\'ha trobat la batalla'], 404);
        }

        //Comprovem que l'usuari autenticat és el jugador dos de la batalla (el invitat)
        if ($battle->player_two_id !== $user->id) {
            return response()->json(['error' => 'No tens permís per acceptar aquesta batalla'], 403);
        }

        //Comprovem que la batalla està pendent
        if ($battle->status !== 'pending') {
            return response()->json(['error' => 'La batalla ja ha estat acceptada o completada'], 400);
        }

        //Actualitzem l'estat de la batalla a "accepted" — ara els dos jugadors poden entrar a la pàgina de batalla
        $battle->status = 'accepted';
        $battle->save();

        return response()->json(
            $battle->load(['playerOne', 'playerTwo', 'xuxemonOne.xuxemon', 'xuxemonTwo.xuxemon', 'winner'])
        );
    }

    //Mètode per seleccionar un xuxemon per a una batalla acceptada (cada jugador tria el seu xuxemon sa)
    public function selectXuxemon(Request $request, $id)
    {
        $user = Auth::guard('api')->user();

        if (!$user) {
            return response()->json(['error' => 'No autoritzat'], 401);
        }

        $battle = Battle::find($id);

        if (!$battle) {
            return response()->json(['error' => 'No s\'ha trobat la batalla'], 404);
        }

        //Només es pot seleccionar xuxemon en batalles acceptades
        if ($battle->status !== 'accepted') {
            return response()->json(['error' => 'La batalla no està en estat acceptat'], 400);
        }

        $owned_xuxemon_id = $request->owned_xuxemon_id;

        //Comprovem que el xuxemon existeix i pertany a l'usuari autenticat
        $xuxemon = OwnedXuxemon::where('id', $owned_xuxemon_id)
            ->where('user_id', $user->id)
            ->first();

        if (!$xuxemon) {
            return response()->json(['error' => 'Xuxemon no trobat o no et pertany'], 400);
        }

        //Comprovem que el xuxemon no té malalties (ha de ser sa per lluitar)
        if ($xuxemon->illnesses()->count() > 0) {
            return response()->json(['error' => 'El xuxemon està malalt i no pot lluitar'], 400);
        }

        //Assignem el xuxemon al jugador corresponent i resetegem el flag "ready" (per si canvia de xuxemon)
        if ($battle->player_one_id === $user->id) {
            $battle->xuxemon_player_one_id = $owned_xuxemon_id;
            $battle->player_one_ready = false;
        } elseif ($battle->player_two_id === $user->id) {
            $battle->xuxemon_player_two_id = $owned_xuxemon_id;
            $battle->player_two_ready = false;
        } else {
            return response()->json(['error' => 'No ets part d\'aquesta batalla'], 403);
        }

        $battle->save();

        return response()->json(
            $battle->load(['playerOne', 'playerTwo', 'xuxemonOne.xuxemon', 'xuxemonTwo.xuxemon', 'winner'])
        );
    }

    //Mètode per marcar que un jugador està preparat per lluitar.
    //Quan els DOS jugadors estan preparats, la batalla es resol automàticament.
    public function fight($id)
    {
        $user = Auth::guard('api')->user();

        if (!$user) {
            return response()->json(['error' => 'No autoritzat'], 401);
        }

        $battle = Battle::with(['xuxemonOne.xuxemon', 'xuxemonTwo.xuxemon'])->find($id);

        if (!$battle) {
            return response()->json(['error' => 'No s\'ha trobat la batalla'], 404);
        }

        if ($battle->status !== 'accepted') {
            return response()->json(['error' => 'La batalla ja ha començat o s\'ha completat'], 400);
        }

        //Marquem el jugador actual com a preparat ("ready")
        if ($battle->player_one_id === $user->id) {
            $battle->player_one_ready = true;
        } elseif ($battle->player_two_id === $user->id) {
            $battle->player_two_ready = true;
        } else {
            return response()->json(['error' => 'No ets part d\'aquesta batalla'], 403);
        }

        $battle->save();

        //Si els dos jugadors encara NO estan preparats, retornem la batalla amb l'estat actual (esperant rival)
        if (!$battle->player_one_ready || !$battle->player_two_ready) {
            return response()->json([
                'waiting' => true,
                'message' => 'Esperant que l\'altre jugador estigui preparat...',
                'player_one_ready' => $battle->player_one_ready,
                'player_two_ready' => $battle->player_two_ready
            ]);
        }

    
        //Obtenim els Xuxemons dels jugadors
        $xuxemonOne = $battle->xuxemonOne;
        $xuxemonTwo = $battle->xuxemonTwo;

        //Simulem el llançament dels daus (1D6)
        $dice_p1 = rand(1, 6);
        $dice_p2 = rand(1, 6);

        //Calculem modificadors segons avantatges de tipus i mida
        $modifier_p1 = $this->calculateModifier($xuxemonOne, $xuxemonTwo);
        $modifier_p2 = $this->calculateModifier($xuxemonTwo, $xuxemonOne);

        //Calculem el resultat final sumant el dau i el modificador
        $score_p1 = $dice_p1 + $modifier_p1;
        $score_p2 = $dice_p2 + $modifier_p2;

        $winner_id = null;

        //Declarem el guanyador segons el resultat final
        if ($score_p1 > $score_p2) {
            $winner_id = $battle->player_one_id;
        } elseif ($score_p2 > $score_p1) {
            $winner_id = $battle->player_two_id;
        }
        //Si els scores són iguals, winner_id queda null (empat)

        //Actualitzem la batalla amb els resultats
        $battle->update([
            'dice_player_one' => $dice_p1,
            'dice_player_two' => $dice_p2,
            'modifier_player_one' => $modifier_p1,
            'modifier_player_two' => $modifier_p2,
            'winner_id' => $winner_id,
            'status' => 'completed'
        ]);

        //Si hi ha guanyador, el guanyador roba el xuxemon del perdedor
        if ($winner_id) {
            if ($winner_id === $battle->player_one_id) {
                $loserXuxemon = $xuxemonTwo;
            } else {
                $loserXuxemon = $xuxemonOne;
            }
            //Actualitzem el propietari del Xuxemon perdedor al guanyador
            $loserXuxemon->user_id = $winner_id;
            $loserXuxemon->save();
        }

        $freshBattle = $battle->fresh()->load(['playerOne', 'playerTwo', 'xuxemonOne.xuxemon', 'xuxemonTwo.xuxemon', 'winner']);

        //Emitim l'event de batalla actualitzada via Pusher perquè ambdós jugadors rebin el resultat en temps real
        broadcast(new BattleUpdated($battle->id, $freshBattle));

        //Retornem la batalla actualitzada amb els resultats
        return response()->json($freshBattle);
    }

    //Mètode per calcular el modificador de cada jugador segons els avantatges de tipus i mida
    private function calculateModifier($ownedXuxemon, $opponentOwned)
    {
        $modifier = 0;

        //Obtenim el tipus del xuxemon base (la relació OwnedXuxemon -> Xuxemon)
        $type = $ownedXuxemon->xuxemon->type ?? null;
        $opponentType = $opponentOwned->xuxemon->type ?? null;

        //Comprovem avantatges/desavantatges de tipus
        if ($type && $opponentType) {
            if ($this->hasAdvantage($type, $opponentType)) {
                $modifier += 1; // +1 si el tipus del Xuxemon té avantatge
            } elseif ($this->hasAdvantage($opponentType, $type)) {
                $modifier -= 1; // -1 si el tipus del Xuxemon té desavantatge
            }
        }

        //Avantatge de mida (+1 mitja, +2 gran, 0 petit)
        switch ($ownedXuxemon->size) {
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
        //tierra gana aigua, aigua gana aire, aire gana tierra
        $advantages = [
            'aire' => 'tierra',
            'aigua' => 'aire',
            'tierra' => 'aigua',
        ];
        return isset($advantages[$type1]) && $advantages[$type1] === $type2;
    }
}
