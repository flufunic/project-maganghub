<?php

namespace Database\Seeders;

use App\Models\Department;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class ProduksiSeeder extends Seeder
{
    public function run(): void
    {
        // Hapus akun uji lama yang memakai underscore
        User::whereIn('name', ['spv_produksi', 'op_produksi'])->delete();

        $headrest = Department::firstOrCreate(['nama' => 'Headrest']);

        $akun = [
            [
                'name'     => 'spvproduksi',
                'email'    => 'spvproduksi@gmail.com',
                'role'     => 'spv_produksi',
                'password' => 'spvproduksi123',
            ],
            [
                'name'     => 'opproduksi',
                'email'    => 'opproduksi@gmail.com',
                'role'     => 'operator_produksi',
                'password' => 'opproduksi123',
            ],
        ];

        foreach ($akun as $a) {
            $user = User::firstOrNew(['name' => $a['name']]);

            $user->forceFill([
                'email'                => $a['email'],
                'role'                 => $a['role'],
                'department_id'        => $headrest->id,
                'is_active'            => true,
                'must_change_password' => true,
                'password'             => Hash::make($a['password']),
            ])->save();
        }
    }
}