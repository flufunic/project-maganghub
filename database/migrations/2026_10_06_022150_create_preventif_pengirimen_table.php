<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('preventif_pengirimans', function (Blueprint $table) {
            $table->id();

            $table->date('tanggal');

            $table->foreignId('dikirim_oleh')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            $table->timestamp('dikirim_pada')->nullable();

            $table->string('status')->default('menunggu');

            $table->timestamps();

            $table->unique('tanggal');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('preventif_pengirimans');
    }
};