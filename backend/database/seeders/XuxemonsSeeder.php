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
            ['name' => 'Apleki',  'type' => 'tierra', 'size' => 'petit', 'xuxes' => 0],
            ['name' => 'Avecrem',   'type' => 'aire', 'size' => 'petit', 'xuxes' => 0],
            ['name' => 'Bambino',  'type' => 'tierra', 'size' => 'petit', 'xuxes' => 0],
            ['name' => 'Beboo',  'type' => 'aire', 'size' => 'petit', 'xuxes' => 0],
            ['name' => 'Boo-hoot', 'type' => 'aire', 'size' => 'petit', 'xuxes' => 0],
            ['name' => 'Cabrales',  'type' => 'tierra', 'size' => 'petit', 'xuxes' => 0],
            ['name' => 'Catua',   'type' => 'aire', 'size' => 'petit', 'xuxes' => 0],
            ['name' => 'Catyuska',   'type' => 'aire', 'size' => 'petit', 'xuxes' => 0],
            ['name' => 'Chapapa',  'type' => 'agua', 'size' => 'petit', 'xuxes' => 0],
            ['name' => 'Chopper',  'type' => 'tierra', 'size' => 'petit', 'xuxes' => 0],
            ['name' => 'Cuellilargui',  'type' => 'tierra', 'size' => 'petit','xuxes' => 0],
            ['name' => 'Deskangoo',  'type' => 'tierra', 'size' => 'petit', 'xuxes' => 0],
            ['name' => 'Doflamingo',  'type' => 'aire', 'size' => 'petit', 'xuxes' => 0],
            ['name' => 'Dolly',  'type' => 'tierra', 'size' => 'petit', 'xuxes' => 0],
            ['name' => 'Elconchudo',  'type' => 'agua', 'size' => 'petit', 'xuxes' => 0],
            ['name' => 'Eldientes',  'type' => 'agua', 'size' => 'petit', 'xuxes' => 0],
            ['name' => 'Elgominas',  'type' => 'tierra', 'size' => 'petit', 'xuxes' => 0],
            ['name' => 'Flipper',  'type' => 'agua', 'size' => 'petit', 'xuxes' => 0],
            ['name' => 'Floppi',  'type' => 'tierra', 'size' => 'petit', 'xuxes' => 0],
            ['name' => 'Horseluis',  'type' => 'agua', 'size' => 'petit', 'xuxes' => 0],
            ['name' => 'Krokolisko',  'type' => 'agua', 'size' => 'petit', 'xuxes' => 0],
            ['name' => 'Kurama',  'type' => 'tierra', 'size' => 'petit', 'xuxes' => 0],
            ['name' => 'Ladybug',  'type' => 'aire', 'size' => 'petit', 'xuxes' => 0],
            ['name' => 'Lengualargui',  'type' => 'tierra', 'size' => 'petit', 'xuxes' => 0],
            ['name' => 'Medusation',  'type' => 'agua', 'size' => 'petit', 'xuxes' => 0],
            ['name' => 'Meekmeek',  'type' => 'tierra', 'size' => 'petit', 'xuxes' => 0],
            ['name' => 'Megalo',  'type' => 'agua', 'size' => 'petit', 'xuxes' => 0],
            ['name' => 'Mocha',  'type' => 'agua', 'size' => 'petit', 'xuxes' => 0],
            ['name' => 'Murcimurci',  'type' => 'aire', 'size' => 'petit', 'xuxes' => 0],
            ['name' => 'Nemo',  'type' => 'agua', 'size' => 'petit', 'xuxes' => 0],
            ['name' => 'Oinkcelot',  'type' => 'tierra', 'size' => 'petit','xuxes' => 0],
            ['name' => 'Oreo',  'type' => 'tierra', 'size' => 'petit', 'xuxes' => 0],
            ['name' => 'Otto',  'type' => 'tierra', 'size' => 'petit', 'xuxes' => 0],
            ['name' => 'Pinchimott',  'type' => 'agua', 'size' => 'petit', 'xuxes' => 0],
            ['name' => 'Posón',  'type' => 'aire', 'size' => 'petit', 'xuxes' => 0],
            ['name' => 'Pollis',  'type' => 'aire', 'size' => 'petit', 'xuxes' => 0],
            ['name' => 'Quakko',  'type' => 'agua', 'size' => 'petit', 'xuxes' => 0],
            ['name' => 'Rajoy',  'type' => 'aire', 'size' => 'petit', 'xuxes' => 0],
            ['name' => 'Rawlion',  'type' => 'tierra', 'size' => 'petit', 'xuxes' => 0],
            ['name' => 'Rexxo',  'type' => 'tierra', 'size' => 'petit', 'xuxes' => 0],
            ['name' => 'Ron',  'type' => 'tierra', 'size' => 'petit', 'xuxes' => 0],
            ['name' => 'Sesssi',  'type' => 'tierra', 'size' => 'petit', 'xuxes' => 0],
            ['name' => 'Shelly',  'type' => 'agua', 'size' => 'petit', 'xuxes' => 0],
            ['name' => 'Sirucco',  'type' => 'aire', 'size' => 'petit', 'xuxes' => 0],
            ['name' => 'Torcas',  'type' => 'agua', 'size' => 'petit', 'xuxes' => 0],
            ['name' => 'Trompeta',  'type' => 'aire', 'size' => 'petit', 'xuxes' => 0],
            ['name' => 'Trompi',  'type' => 'tierra', 'size' => 'petit', 'xuxes' => 0],
            ['name' => 'Tux',  'type' => 'agua', 'size' => 'petit', 'xuxes' => 0],
        ];

        //Enchufar seeder a la BD
        foreach ($xuxemons as $xuxemon) {
            Xuxemon::create($xuxemon);
        }
    }
}
