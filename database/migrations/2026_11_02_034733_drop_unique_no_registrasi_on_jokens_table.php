<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('jokens', function (Blueprint $table) {
            $table->dropUnique(['no_registrasi']);
            $table->index('no_registrasi');
        });
    }

    public function down(): void
    {
        Schema::table('jokens', function (Blueprint $table) {
            $table->dropIndex(['no_registrasi']);
            $table->unique('no_registrasi');
        });
    }
};