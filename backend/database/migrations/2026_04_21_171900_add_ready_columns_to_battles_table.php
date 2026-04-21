<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Afegim camps per controlar si cada jugador està preparat per lluitar.
     * Quan els dos estan preparats (ready), la batalla es resol automàticament.
     */
    public function up(): void
    {
        Schema::table('battles', function (Blueprint $table) {
            $table->boolean('player_one_ready')->default(false);
            $table->boolean('player_two_ready')->default(false);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('battles', function (Blueprint $table) {
            $table->dropColumn(['player_one_ready', 'player_two_ready']);
        });
    }
};
