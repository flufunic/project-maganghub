<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('preventif_checklists', function (Blueprint $table) {
            $table->id();

            $table->unsignedBigInteger('preventif_mesin_id');

            $table->date('tanggal');

            $table->boolean('status')->default(false);

            $table->timestamps();

            $table->foreign('preventif_mesin_id')
                ->references('no')
                ->on('preventif_mesins')
                ->cascadeOnDelete();

            $table->unique([
                'preventif_mesin_id',
                'tanggal',
            ]);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('preventif_checklists');
    }
};Schema::getColumns('preventif_mesins');