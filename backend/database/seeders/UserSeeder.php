<?php

namespace Database\Seeders;


use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
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
         //Create an user onthe PSQL

         $user = User::factory()->create([

        'name' => 'Paula Buendía',
        'email'=> 'paula.buendia@example.com',
        'email_verified_at' => now(),
        'password'=> Hash::make('contrasena'), // contrasena hased text 
         ]);

         
         
         // Creatre adminlux user 
         
         $userAdmin = User::factory()->create([
             'name' => 'Admin Lux',
             'email'=> 'adminlux@example.com',
             'email_verified_at' => now(),
             'password'=> Hash::make('contrasena'),
        ]);
             

        // Assigning roles 

        $adminRole = Role::create([
            'name' => 'admin'
        ]);

        $userRole = Role::create([
            'name' => 'user',
        ]);

             $userAdmin->assignRole($adminRole);
             $user->assignRole($userRole);

    }
}
