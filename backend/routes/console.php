<?php

use App\Models\Setting;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

$time = Setting::where('key', 'daily_xuxes_time')->value('value') ?? '08:00';
Schedule::command('xuxes:daily')->dailyAt($time);
