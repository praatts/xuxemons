<?php

namespace Database\Seeders;

use App\Models\Illness;
use App\Models\Item;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class ItemsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $xuxes = [
            ['name' => 'Xuxe verda', 'stackable' => true, 'max_capacity' => 5],
            ['name' => 'Xuxe blava', 'stackable' => true, 'max_capacity' => 5],
            ['name' => 'Xuxe vermella', 'stackable' => true, 'max_capacity' => 5],
        ];

        foreach ($xuxes as $xuxe) {
            Item::updateOrCreate(['name' => $xuxe['name']], $xuxe);
        }

        $vacunes = [
            ['name' => 'Xocolatina', 'illness_name' => 'Bajón de azúcar'],
            ['name' => 'Xal de fruites', 'illness_name' => 'Atracón'],
            ['name' => 'Inxulina', 'illness_name' => null],
        ];

        foreach ($vacunes as $vacuna) {
        $illness_id = $vacuna['illness_name'] ? Illness::where('name', $vacuna['illness_name'])->value('id') : null;

        Item::updateOrCreate(
            ['name' => $vacuna['name']],
            ['stackable' => false, 'max_capacity' => 1, 'illness_id' => $illness_id]
        );
    }
    }
}
