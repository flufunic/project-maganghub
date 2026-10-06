<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('check_sheets', function (Blueprint $table) {
            $table->id();

            $table->foreignId('mesin_id')
                ->constrained('mesins')
                ->cascadeOnDelete();

            $table->string('nomor_dokumen')->unique();
            $table->string('nama_checksheet');

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('check_sheets');
    }
};