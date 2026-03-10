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
<<<<<<< HEAD:backend/database/migrations/2026_03_03_184625_create_user_xuxe_table.php
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('xuxe_id')->constrained('xuxemons')->onDelete('cascade');
            $table->unsignedInteger('quantity')->default(1);
=======
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('xuxemon_id')->constrained('xuxemons')->onDelete('cascade');
            $table->integer('number_xuxes')->default(0);
            $table->enum('size', ['petit', 'mitja', 'gran']);
>>>>>>> 34efa8466655cb151f8f37b3bf4f73dd981bcc35:backend/database/migrations/2026_03_03_184625_create_owned_xuxemons_table.php
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
