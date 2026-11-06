
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('preventif_mesin_plan_overrides', function (Blueprint $table) {
            $table->id();

            // Mengikuti primary key preventif_mesins.no
            $table->unsignedBigInteger('preventif_mesin_id');

            $table->year('tahun');
            $table->unsignedTinyInteger('bulan');

            // Menyimpan tanggal Plan manual dalam bentuk array JSON
            $table->json('tanggal_plan');

            $table->timestamps();

            // Satu data Plan manual untuk satu mesin per bulan
            $table->unique(
                ['preventif_mesin_id', 'tahun', 'bulan'],
                'unique_preventif_mesin_plan_bulanan'
            );

            $table->foreign('preventif_mesin_id')
                ->references('no')
                ->on('preventif_mesins')
                ->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('preventif_mesin_plan_overrides');
    }
};
