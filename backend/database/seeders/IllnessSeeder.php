<?php

namespace Database\Seeders;

use App\Models\Illness;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class IllnessSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $illnesses = [
            ['key' => 'bajon_azucar', 'name' => 'Bajón de azúcar', 'description' => 'Requereix +2 xuxes per nivell per créixer', 'infection_percentage' => 5],
            ['key' => 'sobredosis_azucar','name' => 'Sobredosis de sucre', 'description' => '', 'infection_percentage' => 10],
            ['key' => 'atracon', 'name' => 'Atracón', 'description' => 'El xuxemon no pot alimentar-se', 'infection_percentage' => 15],
        ];

        foreach ($illnesses as $i) {
            Illness::updateOrCreate(['name' => $i['name']], $i);
        }
    }
}
