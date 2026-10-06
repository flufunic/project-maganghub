<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('check_sheet_items', function (Blueprint $table) {
            $table->enum('shift', ['A', 'B'])->change();
        });
    }

    public function down(): void
    {
        Schema::table('check_sheet_items', function (Blueprint $table) {
            $table->string('shift')->nullable()->change();
        });
    }
};