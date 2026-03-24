<?php

use App\Models\Setting;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Schedule::command('xuxes:daily')->dailyAt(
    rescue(fn() => Setting::where('key', 'daily_xuxes_time')->value('value') ?? '08:00', '08:00')
);

Schedule::command('xuxemons:daily')->dailyAt(
    rescue(fn() => Setting::where('key', 'daily_xuxemons_time')->value('value') ?? '08:00', '08:00')
);