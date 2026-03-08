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

    

         User::factory()->create([
            'player_id' => '#admin0001',
            'name' => 'admin',
            'surname' => 'administrador',
            'email' => 'admin@xuxemons.com',
            'role' => 'admin',
            'pfp' => 'https://images.freeimages.com/fic/images/icons/2526/bloggers/256/admin.png',
            'password' => bcrypt(123456),
        ]);

        $this->call([
            ItemsSeeder::class,
            XuxemonsSeeder::class,
        ]);
    }
}
