<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('check_sheets', function (Blueprint $table) {
            $table->boolean('pakai_actual')->default(false);
        });

        Schema::table('check_sheet_checklists', function (Blueprint $table) {
            $table->decimal('actual', 14, 2)->nullable();
            $table->decimal('selisih', 14, 2)->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('check_sheet_checklists', function (Blueprint $table) {
            $table->dropColumn(['actual', 'selisih']);
        });

        Schema::table('check_sheets', function (Blueprint $table) {
            $table->dropColumn('pakai_actual');
        });
    }
};