<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// proses_penting: boolean -> teks (inputan manual)
// tanggal_revisi: kolom manual di tabel utama
return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasColumn('sop_documents', 'proses_penting')) {
            Schema::table('sop_documents', function (Blueprint $table) {
                $table->dropColumn('proses_penting');
            });
        }

        Schema::table('sop_documents', function (Blueprint $table) {
            $table->string('proses_penting')->nullable()->after('proses');

            if (! Schema::hasColumn('sop_documents', 'tanggal_revisi')) {
                $table->date('tanggal_revisi')->nullable()->after('proses_penting');
            }
        });
    }

    public function down(): void
    {
        Schema::table('sop_documents', function (Blueprint $table) {
            $table->dropColumn(['proses_penting', 'tanggal_revisi']);
        });

        Schema::table('sop_documents', function (Blueprint $table) {
            $table->boolean('proses_penting')->default(false);
        });
    }
};
