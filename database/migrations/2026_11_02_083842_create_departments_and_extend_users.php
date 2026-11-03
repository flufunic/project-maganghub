<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
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

            $table->boolean('is_active')->default(true);
            $table->boolean('must_change_password')->default(false);
            $table->timestamp('last_login_at')->nullable();

            // Login memakai kolom name, jadi harus unik
            $table->unique('name');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropUnique(['name']);
            $table->dropConstrainedForeignId('department_id');
            $table->dropColumn(['is_active', 'must_change_password', 'last_login_at']);
        });

        Schema::dropIfExists('departments');
    }
};