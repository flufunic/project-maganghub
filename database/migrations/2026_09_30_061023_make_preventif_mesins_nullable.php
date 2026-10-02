<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('preventif_mesins', function (Blueprint $table) {
            $table->decimal('durasi', 4, 2)->nullable()->change();
            $table->decimal('total_durasi', 6, 2)->nullable()->change();
            $table->decimal('dot', 4, 2)->nullable()->change();
            $table->decimal('hot', 4, 2)->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('preventif_mesins', function (Blueprint $table) {
            $table->decimal('durasi', 4, 2)->nullable(false)->change();
            $table->decimal('total_durasi', 6, 2)->nullable(false)->change();
            $table->decimal('dot', 4, 2)->nullable(false)->change();
            $table->decimal('hot', 4, 2)->nullable(false)->change();
        });
    }
};