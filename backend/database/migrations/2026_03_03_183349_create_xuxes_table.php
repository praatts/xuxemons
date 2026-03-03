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
