<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Battle extends Model
{
    protected $fillable = [
        'player_one_id',
        'player_two_id',
        'xuxemon_player_one_id',
        'xuxemon_player_two_id',
        'dice_player_one',
        'dice_player_two',
        'modifier_player_one',
        'modifier_player_two',
        'winner_id',
        'status'
    ];

    public function playerOne() {
        return $this->belongsTo(User::class, 'player_one_id');
    }

    public function playerTwo() {
        return $this->belongsTo(User::class, 'player_two_id');
    }

    public function xuxemonOne() {
        return $this->belongsTo(OwnedXuxemon::class, 'xuxemon_player_one_id');
    }

    public function xuxemonTwo() {
        return $this->belongsTo(OwnedXuxemon::class, 'xuxemon_player_two_id');
    }

    public function winner() {
        return $this->belongsTo(User::class, 'winner_id');
    }

}
