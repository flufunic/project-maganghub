<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('overhaul_satuans')) {
            Schema::create('overhaul_satuans', function (Blueprint $table) {
                $table->id();
                $table->string('nama', 50)->unique();
                $table->timestamps();
            });
        }

        // Isi awal: satuan bawaan + semua satuan yang sudah dipakai di data
        $awal = collect(['jam', 'shot'])
            ->merge(
                DB::table('overhaul_mesins')
                    ->whereNotNull('satuan')
                    ->where('satuan', '!=', '')
                    ->distinct()
                    ->pluck('satuan')
            )
            ->map(fn ($s) => strtolower(trim($s)))
            ->filter()
            ->unique();

        foreach ($awal as $nama) {
            DB::table('overhaul_satuans')->updateOrInsert(
                ['nama' => $nama],
                ['created_at' => now(), 'updated_at' => now()]
            );
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('overhaul_satuans');
    }
};
