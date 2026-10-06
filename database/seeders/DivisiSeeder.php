<?php

namespace Database\Seeders;

use App\Models\Divisi;
use Illuminate\Database\Seeder;

class DivisiSeeder extends Seeder
{
    public function run(): void
    {
        Divisi::create([
            'nama_divisi' => 'Utility',
        ]);

        Divisi::create([
            'nama_divisi' => 'Headrest',
        ]);

        Divisi::create([
            'nama_divisi' => 'Saidan',
        ]);
    }
}