<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('check_sheet_abnormalities', function (Blueprint $table) {
            $table->foreignId('check_sheet_item_id')
                ->nullable()
                ->after('check_sheet_id')
                ->constrained('check_sheet_items')
                ->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('check_sheet_abnormalities', function (Blueprint $table) {
            $table->dropConstrainedForeignId('check_sheet_item_id');
        });
    }
};