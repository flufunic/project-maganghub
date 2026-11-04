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
            if (!Schema::hasColumn('rrf', 'divisi_pelapor')) {
                $table->string('divisi_pelapor')->nullable();
            }
            if (!Schema::hasColumn('rrf', 'lokasi')) {
                $table->string('lokasi')->nullable();
            }
            if (!Schema::hasColumn('rrf', 'nama_mesin')) {
                $table->string('nama_mesin')->nullable();
            }
        });

        Schema::table('rrf', function (Blueprint $table) {
            $table->unsignedBigInteger('machine_id')->nullable()->change();
        });

        if (!Schema::hasColumn('divisis', 'kode_rrf')) {
            Schema::table('divisis', function (Blueprint $table) {
                $table->string('kode_rrf', 5)->nullable();
            });
        }

        if (Schema::hasTable('rrf_machines') && Schema::hasTable('rrf_lines')) {
            DB::statement(
                'UPDATE `rrf` r
                 JOIN `rrf_machines` m ON m.id = r.machine_id
                 JOIN `rrf_lines` l ON l.id = m.rrf_line_id
                 SET r.lokasi = COALESCE(r.lokasi, l.nama),
                     r.nama_mesin = COALESCE(r.nama_mesin, m.nama)
                 WHERE r.machine_id IS NOT NULL'
            );
        }

        DB::statement(
            'UPDATE `rrf` SET divisi_pelapor =
                (SELECT nama_divisi FROM `divisis` WHERE `divisis`.id = `rrf`.divisi_id)
             WHERE divisi_pelapor IS NULL'
        );

        foreach (['Headrest' => 'HR', 'Utility' => 'UT', 'Saidan' => 'SD', 'Sewing' => 'SW'] as $nama => $kode) {
            DB::table('divisis')
                ->where('nama_divisi', $nama)
                ->whereNull('kode_rrf')
                ->update(['kode_rrf' => $kode]);
        }
    }

    public function down(): void
    {
        Schema::table('rrf', function (Blueprint $table) {
            foreach (['divisi_pelapor', 'lokasi', 'nama_mesin'] as $kolom) {
                if (Schema::hasColumn('rrf', $kolom)) {
                    $table->dropColumn($kolom);
                }
            }
        });

        if (Schema::hasColumn('divisis', 'kode_rrf')) {
            Schema::table('divisis', function (Blueprint $table) {
                $table->dropColumn('kode_rrf');
            });
        }
    }
};