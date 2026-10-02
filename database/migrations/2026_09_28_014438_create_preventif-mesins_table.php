<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('preventif_mesins', function (Blueprint $table) {
            $table->id('no');
            $table->text('divisi');
            $table->text('item_preventif');
            $table->string('periode');
            $table->decimal('durasi', 4, 2);
            $table->decimal('total_durasi', 6, 2);
            $table->decimal('dot', 4, 2);
            $table->decimal('hot', 4, 2);
            $table->string('item');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('preventif_mesins');
    }
};