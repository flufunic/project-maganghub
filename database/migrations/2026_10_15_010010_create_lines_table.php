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
        Schema::create('lines', function (Blueprint $table) {
            $table->id();
            $table->foreignId('divisi_id')->constrained('divisis')->cascadeOnDelete();
            $table->string('nama_line');           // "Line 1", "Line 2", "Line 3"
            $table->string('kode')->unique();      // isi barcode, PERMANEN
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('lines');
    }
};
