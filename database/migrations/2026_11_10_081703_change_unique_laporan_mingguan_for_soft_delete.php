<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('preventif_laporan_mingguan', function (Blueprint $table) {
            $table->dropUnique(
                'preventif_laporan_mingguan_tahun_bulan_week_unique'
            );
        });

        DB::statement("
            CREATE UNIQUE INDEX laporan_mingguan_aktif_unique
            ON preventif_laporan_mingguan (
                tahun,
                bulan,
                week,
                deleted_at
            )
        ");
    }

    public function down(): void
    {
        DB::statement("
            DROP INDEX laporan_mingguan_aktif_unique
            ON preventif_laporan_mingguan
        ");

        Schema::table('preventif_laporan_mingguan', function (Blueprint $table) {
            $table->unique(
                ['tahun', 'bulan', 'week'],
                'preventif_laporan_mingguan_tahun_bulan_week_unique'
            );
        });
    }
};