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

        // firstOrCreate: si ya existe, no hace nada. Si no existe, lo crea.
        User::firstOrCreate(
            ['player_id' => '#admin0001'],   // Busca por este campo único
            [                                // Si no existe, lo crea con estos datos
                'name'     => 'admin',
                'surname'  => 'administrador',
                'email'    => 'admin@xuxemons.com',
                'role'     => 'admin',
                'password' => bcrypt(123456),
            ]
        );
        
        /* para que se ejecute el seeder sin tener que elejutarlo especificamente */
        $this->call([
        XuxeSeeder::class,
        ]);  

    }
}
