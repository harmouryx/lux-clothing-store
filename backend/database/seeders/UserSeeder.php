<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create an user onthe PSQL

        $user = User::firstOrCreate(
            ['email' => 'paula.buendia@example.com'],
            [
                'name' => 'Paula',
                'last_name' => 'Buendia',
                'email_verified_at' => now(),
                'password' => Hash::make('contrasena'),
            ]
        );

        $userAdmin = User::firstOrCreate(
            ['email' => 'adminlux@example.com'],
            [
                'name' => 'Admin Lux',
                'last_name' => 'Admin Lux',
                'email_verified_at' => now(),
                'password' => Hash::make('contrasena'),
            ]
        );

        // Assigning roles

        $adminRole = Role::firstOrCreate([
            'name' => 'admin',
        ]);

        $userRole = Role::firstOrCreate([
            'name' => 'user',
        ]);

        $userAdmin->assignRole($adminRole);
        $user->assignRole($userRole);

    }
}
