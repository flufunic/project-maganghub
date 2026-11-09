<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('sop_documents', function (Blueprint $table) {
            $table->id();
            $table->string('no_dok')->index();
            $table->string('proses');
            $table->boolean('proses_penting')->default(false);
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('sop_document_revisions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('sop_document_id')->constrained('sop_documents')->cascadeOnDelete();
            $table->unsignedInteger('revisi_ke');
            $table->date('tanggal_revisi');
            $table->text('catatan')->nullable();
            $table->string('file_path');
            $table->string('file_name');
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sop_document_revisions');
        Schema::dropIfExists('sop_documents');
    }
};
