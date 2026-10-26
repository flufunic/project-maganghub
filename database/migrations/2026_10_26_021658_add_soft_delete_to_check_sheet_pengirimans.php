<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('check_sheet_pengirimans', function (Blueprint $table) {
            $table->softDeletes();
            $table->unsignedBigInteger('dihapus_oleh')->nullable()->after('deleted_at');
        });
    }

    public function down(): void
    {
        Schema::table('check_sheet_pengirimans', function (Blueprint $table) {
            $table->dropColumn(['dihapus_oleh', 'deleted_at']);
        });
    }
};