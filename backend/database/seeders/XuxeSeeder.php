<?php

namespace Database\Seeders;

use App\Models\Xuxe;
use Illuminate\Database\Seeder;

class XuxeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $xuxes = [
            ['name' => 'Aqua Petit',  'type' => 'agua',  'size' => 'petit'],
            ['name' => 'Aqua Mitja',  'type' => 'agua',  'size' => 'mitja'],
            ['name' => 'Aqua Gran',   'type' => 'agua',  'size' => 'gran'],
            ['name' => 'Terra Petit', 'type' => 'tierra', 'size' => 'petit'],
            ['name' => 'Terra Mitja', 'type' => 'tierra', 'size' => 'mitja'],
            ['name' => 'Terra Gran',  'type' => 'tierra', 'size' => 'gran'],
            ['name' => 'Aire Petit',  'type' => 'aire',  'size' => 'petit'],
            ['name' => 'Aire Mitja',  'type' => 'aire',  'size' => 'mitja'],
            ['name' => 'Aire Gran',   'type' => 'aire',  'size' => 'gran'],
        ];

        for ($i = 0; $i < count($xuxes); $i++) {
            Xuxe::create($xuxes[$i]);
        }
    }
}
