<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1) Kode item (A..Z, AA, ...). Tabel preventif_mesins TIDAK diubah.
        if (! Schema::hasTable('schedule_item_kodes')) {
            Schema::create('schedule_item_kodes', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('preventif_mesin_id')->unique();
                $table->string('kode', 10)->unique();
                $table->timestamps();
            });
        }

        // 2) Zona: tabel sendiri, tidak berhubungan dengan tabel lain.
        if (! Schema::hasTable('schedule_zonas')) {
            Schema::create('schedule_zonas', function (Blueprint $table) {
                $table->id();
                $table->unsignedInteger('no')->default(0);
                $table->string('zona', 20);
                $table->string('nama_line', 150);
                $table->unsignedInteger('jumlah_mesin')->default(1);
                $table->timestamps();
            });
        }

        // 3) Jadwal PLAN per week: 1 baris = 1 kode item pada 1 week.
        //    Tidak ada kolom zona. ACT tidak disimpan, dihitung dari preventif_checklists.
        Schema::dropIfExists('schedule_preventif_plans');

        Schema::create('schedule_preventif_plans', function (Blueprint $table) {
            $table->id();
            $table->unsignedSmallInteger('tahun');
            $table->unsignedBigInteger('preventif_mesin_id')->index();
            $table->unsignedTinyInteger('bulan');   // 1..12
            $table->unsignedTinyInteger('minggu');  // 1..4
            $table->timestamps();

            $table->unique(['tahun', 'preventif_mesin_id', 'bulan', 'minggu'], 'uq_schedule_plan');
            $table->index(['tahun', 'bulan', 'minggu']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('schedule_preventif_plans');
        Schema::dropIfExists('schedule_zonas');
        Schema::dropIfExists('schedule_item_kodes');
    }
};
