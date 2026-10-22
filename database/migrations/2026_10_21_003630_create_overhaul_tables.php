<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('overhaul_mesins', function (Blueprint $table) {
            $table->string('satuan', 50)->nullable()->after('standar');
        });

        // Pecah data lama, contoh "6000 jam" -> standar 6000, satuan jam
        DB::table('overhaul_mesins')->get()->each(function ($row) {
            $raw = trim((string) $row->standar);

            if ($raw === '') {
                return;
            }

            $satuan = null;

            if (preg_match('/(jam|shot|shoot)\s*$/i', $raw, $m)) {
                $satuan = strtolower($m[1]) === 'shoot' ? 'shot' : strtolower($m[1]);
            }

            $angka = preg_replace('/\D/', '', $raw);

            DB::table('overhaul_mesins')
                ->where('id', $row->id)
                ->update([
                    'standar' => $angka !== '' ? $angka : null,
                    'satuan'  => $satuan,
                ]);
        });
    }

    public function down(): void
    {
        Schema::table('overhaul_mesins', function (Blueprint $table) {
            $table->dropColumn('satuan');
        });
    }
};
