<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('check_sheet_checklists', function (Blueprint $table) {
            $table->id();

            $table->foreignId('check_sheet_item_id')
                ->constrained('check_sheet_items')
                ->cascadeOnDelete();

            $table->date('tanggal');

            $table->boolean('status')->default(false);

            $table->text('catatan')->nullable();

            $table->timestamps();

            $table->unique([
                'check_sheet_item_id',
                'tanggal',
            ]);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('check_sheet_checklists');
    }
};