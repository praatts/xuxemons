<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Setting;

class SettingsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $settings = [
            ['key' => 'little_to_mid', 'value' => '3'],
            ['key' => 'mid_to_big', 'value' => '5'],
            ['key' => 'daily_xuxes_quantity', 'value' => '10'],
            ['key' => 'daily_xuxes_time', 'value' => '08:00'],
        ];

        foreach ($settings as $setting) {
            Setting::updateOrCreate(['key' => $setting['key']], $setting);
        }
    }
}
