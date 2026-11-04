<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('rrf_notifications', function (Blueprint $table) {
            $table->id();

            $table->foreignId('user_id')
                ->constrained('users')
                ->cascadeOnDelete();

            $table->foreignId('rrf_id')
                ->constrained('rrf')
                ->cascadeOnDelete();

            $table->string('judul');
            $table->text('pesan');
            $table->timestamp('dibaca_pada')->nullable();

            $table->timestamps();

            $table->index(['user_id', 'dibaca_pada']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('rrf_notifications');
    }
};