<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('check_sheets', function (Blueprint $table) {
            $table->dropForeign(['mesin_id']);
            $table->dropColumn('mesin_id');
        });
    }

    public function down(): void
    {
        Schema::table('check_sheets', function (Blueprint $table) {
            $table->foreignId('mesin_id')
                ->constrained('mesins')
                ->cascadeOnDelete();
        });
    }
};