<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Foundation\Application;
use Illuminate\Console\Scheduling\Schedule;

// Existing inspire command
Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote')->hourly();

// Schedule your visitor info cleanup command
Application::getInstance()->booted(function () {
    $schedule = app(Schedule::class);

    // Schedule your command to run daily at 10:00 AM
    $schedule->command('visitor-info:delete-old')
        ->dailyAt('10:00')
        ->timezone(config('app.timezone'))
        ->description('Clean up visitor records older than 24 hours');
});
