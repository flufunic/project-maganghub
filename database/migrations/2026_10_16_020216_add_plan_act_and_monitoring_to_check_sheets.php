<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Penanda jenis check sheet
        Schema::table('check_sheets', function (Blueprint $table) {
            $table->boolean('pakai_plan_act')->default(false);
            $table->boolean('pakai_monitoring')->default(false);
            $table->boolean('pakai_bbm')->default(false);
        });

        // Kolom Plan per tanggal (Act memakai kolom status yang sudah ada)
        Schema::table('check_sheet_checklists', function (Blueprint $table) {
            $table->boolean('plan')->default(false)->after('status');
        });

        // Daftar item monitoring (dipakai tabel 2 dan tabel 3)
        Schema::create('check_sheet_monitoring_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('check_sheet_id')
                ->constrained('check_sheets')
                ->cascadeOnDelete();
            $table->unsignedInteger('no');
            $table->string('nama_item');
            $table->string('kapasitas')->nullable();
            $table->decimal('solar_per_menit', 8, 4)->default(0); // L/menit
            $table->timestamps();
            $table->softDeletes();
        });

        // Data per minggu: foto + running hours
        Schema::create('check_sheet_monitoring_weeks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('monitoring_item_id')
                ->constrained('check_sheet_monitoring_items')
                ->cascadeOnDelete();
            $table->unsignedSmallInteger('tahun');
            $table->unsignedTinyInteger('bulan');
            $table->unsignedTinyInteger('week'); // 1-5
            $table->string('foto_path')->nullable();
            $table->decimal('running_hours', 10, 2)->nullable(); // jam, input manual
            $table->timestamps();

            $table->unique(
                ['monitoring_item_id', 'tahun', 'bulan', 'week'],
                'cs_mon_week_unique'
            );
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('check_sheet_monitoring_weeks');
        Schema::dropIfExists('check_sheet_monitoring_items');

        Schema::table('check_sheet_checklists', function (Blueprint $table) {
            $table->dropColumn('plan');
        });

        Schema::table('check_sheets', function (Blueprint $table) {
            $table->dropColumn(['pakai_plan_act', 'pakai_monitoring', 'pakai_bbm']);
        });
    }
};