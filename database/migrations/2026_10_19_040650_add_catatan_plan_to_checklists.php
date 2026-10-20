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
        Schema::table('check_sheet_checklists', function (Blueprint $table) {
            $table->string('catatan_plan', 255)->nullable()->after('catatan');
        });
    }

    public function down(): void
    {
        Schema::table('check_sheet_checklists', function (Blueprint $table) {
            $table->dropColumn('catatan_plan');
        });
    }
};
