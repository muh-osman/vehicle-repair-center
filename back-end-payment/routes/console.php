<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;

use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote')->hourly();


// Mojaz reports: init then download pdf Mojaz report after pay
Schedule::command('queue:work --timeout=90 --stop-when-empty')
    ->everyMinute()
    ->withoutOverlapping()
    ->runInBackground();
