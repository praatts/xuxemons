<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

         User::factory()->create([
            'player_id' => '#admin0001',
            'name' => 'admin',
            'surname' => 'administrador',
            'email' => 'admin@xuxemons.com',
            'role' => 'admin',
            'password' => bcrypt(123456),
        ]);
        
        /* para que se ejecute el seeder sin tener que elejutarlo especificamente */
        $this->call([
        XuxeSeeder::class,
        ]);  

    }
}
