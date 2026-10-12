<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('preventif_mesin_bulanans', function (Blueprint $table) {
            $table->id();

            // sesuaikan tipe dengan kolom `no` di preventif_mesins
            $table->unsignedBigInteger('preventif_mesin_id');

            $table->unsignedSmallInteger('tahun');
            $table->unsignedTinyInteger('bulan');

            $table->decimal('durasi', 8, 2)->nullable();
            $table->decimal('total_durasi', 8, 2)->nullable();
            $table->decimal('dot', 8, 2)->nullable();
            $table->decimal('hot', 8, 2)->nullable();

            $table->unique(
                ['preventif_mesin_id', 'tahun', 'bulan'],
                'preventif_bulanan_unique'
            );

            $table->index('preventif_mesin_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('preventif_mesin_bulanans');
    }
};