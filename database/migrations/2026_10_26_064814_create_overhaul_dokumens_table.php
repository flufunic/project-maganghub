<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('overhaul_dokumens', function (Blueprint $table) {
            $table->id();
            $table->foreignId('overhaul_mesin_id')
                ->constrained('overhaul_mesins')
                ->cascadeOnDelete();
            $table->string('nama_asli');
            $table->string('path');
            $table->string('mime')->nullable();
            $table->unsignedBigInteger('ukuran')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('overhaul_dokumens');
    }
};