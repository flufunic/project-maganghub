<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('check_sheet_lubrications', function (Blueprint $table) {
            // pelumasan dicatat per line / mesin (sama seperti checklist & abnormality)
            $table->foreignId('line_id')
                ->nullable()
                ->after('check_sheet_id')
                ->constrained('lines')
                ->nullOnDelete();

            $table->index(['check_sheet_id', 'line_id']);
        });

        // Check sheet milik satu mesin: data pelumasan lama otomatis ikut mesinnya.
        // (Check sheet Headrest tidak bisa ditebak line-nya, jadi dibiarkan NULL.)
        DB::statement(
            'UPDATE check_sheet_lubrications l
             JOIN check_sheets s ON s.id = l.check_sheet_id
             SET l.line_id = s.line_id
             WHERE l.line_id IS NULL AND s.line_id IS NOT NULL'
        );
    }

    public function down(): void
    {
        Schema::table('check_sheet_lubrications', function (Blueprint $table) {
            $table->dropIndex(['check_sheet_id', 'line_id']);
            $table->dropConstrainedForeignId('line_id');
        });
    }
};
