<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('battles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('player_one_id')->constrained('users');
            $table->foreignId('player_two_id')->constrained('users');
            $table->foreignId('xuxemon_player_one_id')->constrained('owned_xuxemons');
            $table->foreignId('xuxemon_player_two_id')->constrained('owned_xuxemons');
            $table->integer('dice_player_one')->nullable();
            $table->integer('dice_player_two')->nullable();
            $table->integer('modifier_player_one')->nullable();
            $table->integer('modifier_player_two')->nullable();
            $table->foreignId('winner_id')->nullable()->constrained('users');
            $table->enum('status', ['pending', 'accepted', 'completed'])->default('pending');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('battles');
    }
};
