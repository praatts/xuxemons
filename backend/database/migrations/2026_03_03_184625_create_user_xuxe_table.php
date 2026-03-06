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
        Schema::create('user_xuxe', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('xuxe_id')->constrained('xuxemons')->onDelete('cascade');
            $table->unsignedInteger('quantity')->default(1);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('user_xuxe');
    }
};
