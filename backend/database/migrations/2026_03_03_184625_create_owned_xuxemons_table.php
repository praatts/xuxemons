<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */

    //connecta los usuarios con sus xuxes

    /* muy parecida a create_inventory_table pero sin limites, no hay maximo de filas ni de cantidad */
    public function up(): void
    {
        Schema::create('owned_xuxemons', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('xuxemon_id')->constrained('xuxemons')->onDelete('cascade');
            $table->integer('number_xuxes')->default(0);
            $table->unsignedInteger('quantity')->default(1);
            $table->enum('size', ['petit', 'mitja', 'gran']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('owned_xuxemons');
    }
};
