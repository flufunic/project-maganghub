<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('check_sheet_items', function (Blueprint $table) {
            $table->id();

            $table->foreignId('check_sheet_id')
                ->constrained('check_sheets')
                ->cascadeOnDelete();

            $table->unsignedInteger('no');
            $table->text('inspection_point');
            $table->text('condition')->nullable();
            $table->string('method')->nullable();
            $table->string('shift')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('check_sheet_items');
    }
};