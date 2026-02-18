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
            'player_id' => 'TEST0001',
            'name' => 'NameExample',
            'surename' => 'SurenameExample',
            'email' => 'test@example.com',
            'role' => 'admin'
        ]);
    }
}
