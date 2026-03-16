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
        Schema::create('owned_xuxemon_illnesses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('owned_xuxemon_id')->constrained('owned_xuxemons')->onDelete('cascade');
            $table->enum('illness', ['bajon_azucar', 'atracon']);
            $table->timestamps();

            $table->unique(['owned_xuxemon_id', 'illness']); // no duplicats
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('owned_xuxemon_illnesses');
    }
};
