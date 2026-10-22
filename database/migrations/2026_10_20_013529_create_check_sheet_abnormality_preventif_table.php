<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('check_sheet_abnormality_preventif', function (Blueprint $table) {
            $table->id();

            $table->unsignedBigInteger('check_sheet_abnormality_id');
            // = preventif_mesins.no (tanpa foreign key, sama seperti sebelumnya)
            $table->unsignedBigInteger('preventif_mesin_id');

            $table->timestamps();

            $table->unique(
                ['check_sheet_abnormality_id', 'preventif_mesin_id'],
                'abn_preventif_unique'
            );
            $table->index('preventif_mesin_id');

            $table->foreign('check_sheet_abnormality_id')
                ->references('id')
                ->on('check_sheet_abnormalities')
                ->cascadeOnDelete();
        });

        // Pindahkan data lama (1 item per abnormality) ke pivot
        DB::table('check_sheet_abnormalities')
            ->whereNotNull('preventif_mesin_id')
            ->orderBy('id')
            ->get(['id', 'preventif_mesin_id'])
            ->each(function ($row) {
                DB::table('check_sheet_abnormality_preventif')->insert([
                    'check_sheet_abnormality_id' => $row->id,
                    'preventif_mesin_id'         => $row->preventif_mesin_id,
                    'created_at'                 => now(),
                    'updated_at'                 => now(),
                ]);
            });
    }

    public function down(): void
    {
        Schema::dropIfExists('check_sheet_abnormality_preventif');
    }
};