<?php

namespace Database\Seeders;

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
        $items = [
            ['name' => 'Xuxe verda', 'stackable' => true, 'max_capacity' => 5],
            ['name' => 'Xuxe blava', 'stackable' => true, 'max_capacity' => 5],
            ['name' => 'Xuxe vermella', 'stackable' => true, 'max_capacity' => 5],
            ['name' => 'Vacuna petita', 'stackable' => false, 'max_capacity' => 1],
            ['name' => 'Vacuna mitjana', 'stackable' => false, 'max_capacity' => 1],
            ['name' => 'Vacuna gran', 'stackable' => false, 'max_capacity' => 1],
        ];

        Item::insert($items);
    }
}
