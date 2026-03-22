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
            $table->foreignId('illness_id')->constrained('illnesses')->onDelete('cascade');
            $table->timestamps();
            $table->unique(['owned_xuxemon_id', 'illness_id']);
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
