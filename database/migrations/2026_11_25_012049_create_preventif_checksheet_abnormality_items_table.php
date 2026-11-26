<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Abnormality <-> baris Inspection Point di Checksheet Preventif.
        // Dipakai untuk kolom "Kondisi terakhir" per baris (otomatis dari status abnormality).
        Schema::create('preventif_checksheet_abnormality_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('check_sheet_abnormality_id')
                ->constrained('check_sheet_abnormalities', 'id', 'pcai_abn_fk')
                ->cascadeOnDelete();
            $table->foreignId('preventif_checksheet_item_id')
                ->constrained('preventif_checksheet_items', 'id', 'pcai_item_fk')
                ->cascadeOnDelete();
            $table->timestamps();

            $table->unique(
                ['check_sheet_abnormality_id', 'preventif_checksheet_item_id'],
                'pcai_unique'
            );
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('preventif_checksheet_abnormality_items');
    }
};