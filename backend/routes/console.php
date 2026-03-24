<?php

use App\Models\Setting;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

try {
    $time_xuxes = Setting::where('key', 'daily_xuxes_time')->value('value') ?? '08:00';
    $time_xuxemons = Setting::where('key', 'daily_xuxemons_time')->value('value') ?? '08:00';
} catch (\Exception $e) {
    $time_xuxes = '08:00';
    $time_xuxemons = '08:00';
}

Schedule::command('xuxes:daily')->dailyAt($time_xuxes);
Schedule::command('xuxemons:daily')->dailyAt($time_xuxemons);
