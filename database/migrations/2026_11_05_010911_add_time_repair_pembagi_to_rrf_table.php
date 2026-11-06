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
            if (!Schema::hasColumn('rrf', 'time_repair_pembagi')) {
                $table->unsignedSmallInteger('time_repair_pembagi')->nullable();
            }
            if (!Schema::hasColumn('rrf', 'man_kerja')) {
                $table->string('man_kerja', 20)->nullable();
            }
            if (!Schema::hasColumn('rrf', 'shift_kerja')) {
                $table->string('shift_kerja', 20)->nullable();
            }
        });

        // Data lama dalam menit disalin ke detik (kalau ada)
        if (Schema::hasColumn('rrf', 'downtime_menit') && Schema::hasColumn('rrf', 'downtime_detik')) {
            DB::statement(
                'UPDATE `rrf` SET downtime_detik = downtime_menit * 60
                 WHERE downtime_menit IS NOT NULL AND downtime_detik IS NULL'
            );
        }
    }

    public function down(): void
    {
        Schema::table('rrf', function (Blueprint $table) {
            foreach (['stop_line_at', 'downtime_detik', 'time_repair_detik', 'time_repair_pembagi', 'man_kerja', 'shift_kerja'] as $kolom) {
                if (Schema::hasColumn('rrf', $kolom)) {
                    $table->dropColumn($kolom);
                }
            }
        });
    }
};