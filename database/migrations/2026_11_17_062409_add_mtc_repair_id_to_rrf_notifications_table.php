<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('rrf_notifications', function (Blueprint $table) {
            $table->unsignedBigInteger('rrf_id')->nullable()->change();

            $table->unsignedBigInteger('mtc_repair_id')->nullable()->after('rrf_id');
            $table->index('mtc_repair_id');
        });
    }

    public function down(): void
    {
        Schema::table('rrf_notifications', function (Blueprint $table) {
            $table->dropIndex(['mtc_repair_id']);
            $table->dropColumn('mtc_repair_id');
        });
    }
};