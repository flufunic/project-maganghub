<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('jokens', function (Blueprint $table) {
            $table->id();
            $table->string('judul');
            $table->string('no_registrasi')->unique();
            $table->string('line')->nullable();
            $table->string('model')->nullable();
            $table->string('pic')->nullable();
            $table->string('no_line')->nullable();
            $table->string('supplier')->nullable();
            $table->string('part_name')->nullable();
            $table->string('part_number')->nullable();
            $table->string('mfg_location')->nullable();
            $table->json('kolom')->nullable(); // definisi kolom dinamis
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('jokens');
    }
};