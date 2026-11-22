<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('preventif_divisis')) {
            Schema::create('preventif_divisis', function (Blueprint $table) {
                $table->id();
                $table->string('nama', 50)->unique();
                $table->unsignedInteger('urutan')->default(0);
                $table->timestamps();
            });
        }

        // Isi awal hanya jika tabel masih kosong:
        // 4 divisi lama + divisi apa pun yang sudah terpakai di preventif_mesins
        if (DB::table('preventif_divisis')->count() === 0) {
            $awal = ['Sewing', 'Headrest', 'Utility', 'Saidan'];

            $terpakai = DB::table('preventif_mesins')
                ->whereNotNull('divisi')
                ->where('divisi', '!=', '')
                ->distinct()
                ->pluck('divisi')
                ->all();

            $semua = array_values(array_unique(array_merge($awal, $terpakai)));

            foreach ($semua as $i => $nama) {
                DB::table('preventif_divisis')->insert([
                    'nama' => $nama,
                    'urutan' => $i + 1,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('preventif_divisis');
    }
};