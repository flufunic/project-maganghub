<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Baris jadwal: 1 baris = 1 pasangan Plan + Act. Dibuat per tahun, soft delete.
        if (! Schema::hasTable('schedule_baris')) {
            Schema::create('schedule_baris', function (Blueprint $table) {
                $table->id();
                $table->unsignedSmallInteger('tahun')->index();
                $table->unsignedInteger('urutan')->default(1);
                $table->string('nama', 100)->nullable();   // label opsional, kosong = "Baris N"
                $table->timestamps();
                $table->softDeletes();
            });
        }

        // Isian Plan sekarang menempel ke satu baris jadwal.
        if (! Schema::hasColumn('schedule_preventif_plans', 'baris_id')) {
            Schema::table('schedule_preventif_plans', function (Blueprint $table) {
                $table->unsignedBigInteger('baris_id')->nullable()->after('tahun')->index();
            });

            // Isian lama dipindahkan ke "Baris 1" pada tahun masing-masing.
            DB::table('schedule_preventif_plans')->distinct()->pluck('tahun')->each(function ($tahun) {
                $id = DB::table('schedule_baris')->insertGetId([
                    'tahun' => $tahun,
                    'urutan' => 1,
                    'nama' => null,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);

                DB::table('schedule_preventif_plans')->where('tahun', $tahun)->update(['baris_id' => $id]);
            });

            // Kunci unik lama (tanpa baris) diganti kunci unik per baris.
            try {
                Schema::table('schedule_preventif_plans', function (Blueprint $table) {
                    $table->dropUnique('uq_schedule_plan');
                });
            } catch (\Throwable $e) {
                // indeks lama memang sudah tidak ada
            }

            Schema::table('schedule_preventif_plans', function (Blueprint $table) {
                $table->unique(['baris_id', 'preventif_mesin_id', 'bulan', 'minggu'], 'uq_schedule_plan_baris');
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasColumn('schedule_preventif_plans', 'baris_id')) {
            Schema::table('schedule_preventif_plans', function (Blueprint $table) {
                $table->dropUnique('uq_schedule_plan_baris');
                $table->dropColumn('baris_id');
            });
        }

        Schema::dropIfExists('schedule_baris');
    }
};
