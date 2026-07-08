<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        User::updateOrCreate(
            ['email' => 'admin@sav.com'],
            [
                'name' => 'Admin SAV',
                'password' => Hash::make('123456'),
                'role' => 'admin',
            ]
        );

        User::updateOrCreate(
            ['email' => 'tech@sav.com'],
            [
                'name' => 'Technician SAV',
                'password' => Hash::make('123456'),
                'role' => 'technician',
            ]
        );
    }
}
