<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('schedule_preventif_arsir', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('baris_id');
            $table->unsignedSmallInteger('tahun');
            $table->unsignedTinyInteger('bulan');
            $table->unsignedTinyInteger('minggu');
            $table->timestamps();

            $table->unique(['baris_id', 'tahun', 'bulan', 'minggu'], 'arsir_unik');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('schedule_preventif_arsir');
    }
};