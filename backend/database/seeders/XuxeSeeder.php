<?php

namespace Database\Seeders;

use App\Models\Xuxemon;
use Illuminate\Database\Seeder;

class XuxeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $xuxemons = [
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

        // Enchufar xuxemons a la BD
        foreach ($xuxemons as $xuxemon) {
            Xuxemon::create($xuxemon);
        }
    }
}
