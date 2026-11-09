<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        foreach (Schema::getIndexes('rrf') as $index) {
            if (($index['unique'] ?? false) && $index['columns'] === ['rrf_no']) {
                Schema::table('rrf', function (Blueprint $table) use ($index) {
                    $table->dropUnique($index['name']);
                });
            }
        }
    }

    public function down(): void
    {
        // sengaja kosong
    }
};