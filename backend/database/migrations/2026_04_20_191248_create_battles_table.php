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
            $table->foreignId('player1')->constrained('users');
            $table->foreignId('player2')->constrained('users');
            $table->foreignId('xuxemon_player1')->constrained('owned_xuxemons');
            $table->foreignId('xuxemon_player2')->constrained('owned_xuxemons');
            $table->integer('dice_player1')->nullable();
            $table->integer('dice_player2')->nullable();
            $table->integer('modifier_player1')->nullable();
            $table->integer('modifier_player2')->nullable();
            $table->foreignId('winner')->nullable()->constrained('users');
            $table->enum('status', ['pending', 'in_progress', 'completed'])->default('pending');
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
