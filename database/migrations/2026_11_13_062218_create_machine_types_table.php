<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('machine_types', function (Blueprint $table) {
            $table->id();
            $table->string('nama_alat');
            $table->string('merk')->nullable();
            $table->string('model_type')->nullable();
            $table->string('negara_pembuat')->nullable();
            $table->unsignedSmallInteger('tahun_pembuatan')->nullable();
            $table->unsignedSmallInteger('start_operasional')->nullable();
            $table->string('electric_consumption')->nullable();   // "23 Kva", "0,136 Kva"
            $table->string('supplier_name')->nullable();
            $table->boolean('supplier_active')->default(false);
            $table->boolean('supplier_repair')->default(false);
            $table->string('secondtier')->nullable();
            $table->string('kontak_person')->nullable();
            $table->string('keterangan')->nullable();
            $table->string('panel_monitor_kwh')->nullable();
            $table->string('no_kontrol_raw')->unique();           // teks asli dari Excel, jadi kunci import ulang
            $table->unsignedInteger('qty')->default(1);
            $table->timestamps();

            $table->index('nama_alat');
            $table->index('merk');
            $table->index('negara_pembuat');
            $table->index('panel_monitor_kwh');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('machine_types');
    }
};