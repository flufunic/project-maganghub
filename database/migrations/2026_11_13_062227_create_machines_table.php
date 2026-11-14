<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('machines', function (Blueprint $table) {
            $table->id();
            $table->foreignId('machine_type_id')->constrained()->cascadeOnDelete();
            $table->string('no_kontrol')->unique();   // contoh: FJI-SC2-M.HD 004
            $table->string('barcode')->unique();      // isi barcode (default sama dengan no_kontrol)
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('machines');
    }
};