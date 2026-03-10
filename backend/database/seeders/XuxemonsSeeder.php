<?php

namespace Database\Seeders;

use App\Models\Xuxemon;
use Illuminate\Database\Seeder;

class XuxemonsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $xuxemons = [
            ['name' => 'Apleki',  'type' => 'tierra', 'size' => 'petit'],
            ['name' => 'Avecrem',   'type' => 'aire', 'size' => 'petit'],
            ['name' => 'Bambino',  'type' => 'tierra', 'size' => 'petit'],
            ['name' => 'Beboo',  'type' => 'aire', 'size' => 'petit'],
            ['name' => 'Boo-hoot', 'type' => 'aire', 'size' => 'petit'],
            ['name' => 'Cabrales',  'type' => 'tierra', 'size' => 'petit'],
            ['name' => 'Catua',   'type' => 'aire', 'size' => 'petit'],
            ['name' => 'Catyuska',   'type' => 'aire', 'size' => 'petit'],
            ['name' => 'Chapapa',  'type' => 'agua', 'size' => 'petit'],
            ['name' => 'Chopper',  'type' => 'tierra', 'size' => 'petit'],
            ['name' => 'Cuellilargui',  'type' => 'tierra', 'size' => 'petit'],
            ['name' => 'Deskangoo',  'type' => 'tierra', 'size' => 'petit'],
            ['name' => 'Doflamingo',  'type' => 'aire', 'size' => 'petit'],
            ['name' => 'Dolly',  'type' => 'tierra', 'size' => 'petit'],
            ['name' => 'Elconchudo',  'type' => 'agua', 'size' => 'petit'],
            ['name' => 'Eldientes',  'type' => 'agua', 'size' => 'petit'],
            ['name' => 'Elgominas',  'type' => 'tierra', 'size' => 'petit'],
            ['name' => 'Flipper',  'type' => 'agua', 'size' => 'petit'],
            ['name' => 'Floppi',  'type' => 'tierra', 'size' => 'petit'],
            ['name' => 'Horseluis',  'type' => 'agua', 'size' => 'petit'],
            ['name' => 'Krokolisko',  'type' => 'agua', 'size' => 'petit'],
            ['name' => 'Kurama',  'type' => 'tierra', 'size' => 'petit'],
            ['name' => 'Ladybug',  'type' => 'aire', 'size' => 'petit'],
            ['name' => 'Lengualargui',  'type' => 'tierra', 'size' => 'petit'],
            ['name' => 'Medusation',  'type' => 'agua', 'size' => 'petit'],
            ['name' => 'Meekmeek',  'type' => 'tierra', 'size' => 'petit'],
            ['name' => 'Megalo',  'type' => 'agua', 'size' => 'petit'],
            ['name' => 'Mocha',  'type' => 'agua', 'size' => 'petit'],
            ['name' => 'Murcimurci',  'type' => 'aire', 'size' => 'petit'],
            ['name' => 'Nemo',  'type' => 'agua', 'size' => 'petit'],
            ['name' => 'Oinkcelot',  'type' => 'tierra', 'size' => 'petit'],
            ['name' => 'Oreo',  'type' => 'tierra', 'size' => 'petit'],
            ['name' => 'Otto',  'type' => 'tierra', 'size' => 'petit'],
            ['name' => 'Pinchimott',  'type' => 'agua', 'size' => 'petit'],
            ['name' => 'Posón',  'type' => 'aire', 'size' => 'petit'],
            ['name' => 'Pollis',  'type' => 'aire', 'size' => 'petit'],
            ['name' => 'Quakko',  'type' => 'agua', 'size' => 'petit'],
            ['name' => 'Rajoy',  'type' => 'aire', 'size' => 'petit'],
            ['name' => 'Rawlion',  'type' => 'tierra', 'size' => 'petit'],
            ['name' => 'Rexxo',  'type' => 'tierra', 'size' => 'petit'],
            ['name' => 'Ron',  'type' => 'tierra', 'size' => 'petit'],
            ['name' => 'Sesssi',  'type' => 'tierra', 'size' => 'petit'],
            ['name' => 'Shelly',  'type' => 'agua', 'size' => 'petit'],
            ['name' => 'Sirucco',  'type' => 'aire', 'size' => 'petit'],
            ['name' => 'Torcas',  'type' => 'agua', 'size' => 'petit'],
            ['name' => 'Trompeta',  'type' => 'aire', 'size' => 'petit'],
            ['name' => 'Trompi',  'type' => 'tierra', 'size' => 'petit'],
            ['name' => 'Tux',  'type' => 'agua', 'size' => 'petit'],
        ];

        //Enchufar seeder a la BD
        foreach ($xuxemons as $xuxemon) {
            Xuxemon::create($xuxemon);
        }
    }
}
