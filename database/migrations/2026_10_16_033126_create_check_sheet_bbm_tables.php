<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Item tabel Konsumsi Bahan Bakar (terpisah dari tabel Running Hours)
        Schema::create('check_sheet_bbm_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('check_sheet_id')
                ->constrained('check_sheets')
                ->cascadeOnDelete();
            $table->unsignedInteger('no');
            $table->string('nama_item');                           // Type / Merk
            $table->string('kapasitas')->nullable();               // contoh: 300 Kva
            $table->decimal('solar_per_menit', 8, 4)->default(0);  // L/menit
            $table->timestamps();
            $table->softDeletes();
        });

        // Running hours per minggu, khusus tabel BBM (input sendiri)
        Schema::create('check_sheet_bbm_weeks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('bbm_item_id')
                ->constrained('check_sheet_bbm_items')
                ->cascadeOnDelete();
            $table->unsignedSmallInteger('tahun');
            $table->unsignedTinyInteger('bulan');
            $table->unsignedTinyInteger('week'); // 1-5
            $table->decimal('running_hours', 10, 2)->nullable();
            $table->timestamps();

            $table->unique(
                ['bbm_item_id', 'tahun', 'bulan', 'week'],
                'cs_bbm_week_unique'
            );
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('check_sheet_bbm_weeks');
        Schema::dropIfExists('check_sheet_bbm_items');
    }
};