<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasColumn('preventif_divisis', 'warna')) {
            Schema::table('preventif_divisis', function (Blueprint $table) {
                $table->string('warna', 7)->nullable()->after('nama');
            });
        }

        // 4 divisi lama tetap pakai warna yang sekarang
        $tetap = [
            'Sewing' => '#ea580c',
            'Utility' => '#1e3a8a',
            'Headrest' => '#a855f7',
            'Saidan' => '#10b981',
        ];

        foreach ($tetap as $nama => $warna) {
            DB::table('preventif_divisis')->where('nama', $nama)->update(['warna' => $warna]);
        }

        // divisi lain yang belum punya warna: ambil dari palet yang belum terpakai
        $palet = ['#14b8a6', '#ec4899', '#eab308', '#0ea5e9', '#ef4444', '#84cc16', '#a16207', '#64748b', '#f472b6', '#22d3ee'];
        $dipakai = array_map('strtolower', array_values($tetap));

        foreach (DB::table('preventif_divisis')->whereNull('warna')->get() as $row) {
            $sisa = array_values(array_diff($palet, $dipakai));
            $warna = $sisa ? $sisa[array_rand($sisa)] : sprintf('#%02x%02x%02x', rand(40, 200), rand(40, 200), rand(40, 200));

            DB::table('preventif_divisis')->where('id', $row->id)->update(['warna' => $warna]);
            $dipakai[] = $warna;
        }
    }

    public function down(): void
    {
        Schema::table('preventif_divisis', function (Blueprint $table) {
            $table->dropColumn('warna');
        });
    }
};