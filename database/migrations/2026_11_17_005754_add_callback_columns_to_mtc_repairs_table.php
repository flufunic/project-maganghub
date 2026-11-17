<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('mtc_repairs', function (Blueprint $table) {
            $table->string('callback_status', 20)->nullable()->after('rrf_status');
            $table->unsignedSmallInteger('callback_attempts')->default(0)->after('callback_status');
            $table->dateTime('callback_sent_at')->nullable()->after('callback_attempts');
            $table->text('callback_error')->nullable()->after('callback_sent_at');
        });
    }

    public function down(): void
    {
        Schema::table('mtc_repairs', function (Blueprint $table) {
            $table->dropColumn(['callback_status', 'callback_attempts', 'callback_sent_at', 'callback_error']);
        });
    }
};