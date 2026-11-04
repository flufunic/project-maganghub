<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->foreignId('divisi_id')
                ->nullable()
                ->constrained('divisis')
                ->nullOnDelete();
        });

        // Pindahkan akun yang sudah punya department ke divisi dengan nama sama
        if (Schema::hasTable('departments')) {
            $users = DB::table('users')
                ->whereNotNull('department_id')
                ->get(['id', 'department_id']);

            foreach ($users as $u) {
                $nama = DB::table('departments')->where('id', $u->department_id)->value('nama');
                $divisiId = DB::table('divisis')->where('nama_divisi', $nama)->value('id');

                if ($divisiId) {
                    DB::table('users')->where('id', $u->id)->update(['divisi_id' => $divisiId]);
                }
            }
        }

        Schema::table('users', function (Blueprint $table) {
            $table->dropConstrainedForeignId('department_id');
        });

        Schema::dropIfExists('departments');
    }

    public function down(): void
    {
        Schema::create('departments', function (Blueprint $table) {
            $table->id();
            $table->string('nama')->unique();
            $table->timestamps();
        });

        Schema::table('users', function (Blueprint $table) {
            $table->foreignId('department_id')
                ->nullable()
                ->constrained('departments')
                ->nullOnDelete();
            $table->dropConstrainedForeignId('divisi_id');
        });
    }
};