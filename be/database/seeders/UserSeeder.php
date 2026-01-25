<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        User::create([
            'nama' => 'Muhammad Zadid',
            'email' => 'muhammad.zadid.webdev@gmail.com',
            'password' => bcrypt('Zad1d&teng'),
            'role' => 'admin',
            'phone' => '081234567890',
            'is_active' => 'aktif',
        ]);

        User::create([
            'nama' => 'Sucipto',
            'email' => 'sucipto@gmail.com',
            'password' => bcrypt('Sucipto123'),
            'role' => 'petugas',
            'phone' => '089876543210',
            'is_active' => 'aktif',
        ]);

        User::create([
            'nama' => 'Hendro',
            'email' => 'hendro@gmail.com',
            'password' => bcrypt('Hendro123'),
            'role' => 'peminjam',
            'phone' => '087654321098',
            'is_active' => 'aktif',
        ]);
    }
}
