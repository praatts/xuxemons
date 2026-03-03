<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */

    /* esta es una tabla para todas las xuxes que van a existir en el juego */
    public function up(): void
    {
        Schema::create('xuxes', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->enum('type', ['agua', 'tierra', 'aire']);
            $table->enum('size', ['petit', 'mitja', 'gran']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('xuxes');
    }
};
