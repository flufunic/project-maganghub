<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('rrf', function (Blueprint $table) {
            if (!Schema::hasColumn('rrf', 'pic_nama')) {
                $table->string('pic_nama')->nullable();
            }
            if (!Schema::hasColumn('rrf', 'stop_line_at')) {
                $table->dateTime('stop_line_at')->nullable();
            }
            if (!Schema::hasColumn('rrf', 'downtime_detik')) {
                $table->unsignedInteger('downtime_detik')->nullable();
            }
            if (!Schema::hasColumn('rrf', 'time_repair_detik')) {
                $table->unsignedInteger('time_repair_detik')->nullable();
            }
            if (!Schema::hasColumn('rrf', 'man_kerja')) {
                $table->string('man_kerja', 20)->nullable();
            }
            if (!Schema::hasColumn('rrf', 'shift_kerja')) {
                $table->string('shift_kerja', 20)->nullable();
            }
        });

        if (Schema::hasColumn('rrf', 'downtime_menit')) {
            DB::statement(
                'UPDATE `rrf` SET downtime_detik = downtime_menit * 60
                 WHERE downtime_menit IS NOT NULL AND downtime_detik IS NULL'
            );
        }

        if (!Schema::hasTable('rrf_mesin_items')) {
            Schema::create('rrf_mesin_items', function (Blueprint $table) {
                $table->id();
                $table->foreignId('rrf_id')->constrained('rrf')->cascadeOnDelete();
                $table->string('nama');
                $table->timestamps();

                $table->index('nama');
            });

            // RRF yang sudah ada: satu mesin dari kolom nama_mesin
            $rows = DB::table('rrf')->whereNotNull('nama_mesin')->get(['id', 'nama_mesin']);

            foreach ($rows as $r) {
                DB::table('rrf_mesin_items')->insert([
                    'rrf_id'     => $r->id,
                    'nama'       => $r->nama_mesin,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('rrf_mesin_items');

        Schema::table('rrf', function (Blueprint $table) {
            foreach (['stop_line_at', 'downtime_detik', 'time_repair_detik', 'man_kerja', 'shift_kerja'] as $kolom) {
                if (Schema::hasColumn('rrf', $kolom)) {
                    $table->dropColumn($kolom);
                }
            }
        });
    }
};