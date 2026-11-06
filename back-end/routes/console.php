<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

// Existing inspire command
Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Schedule the inspire command separately (Artisan::command doesn't chain scheduling methods)
Schedule::command('inspire')->hourly();

// Clean up visitor records older than 24 hours, daily at 10:00 AM
Schedule::command('visitor-info:delete-old')
    ->dailyAt('10:00')
    ->timezone(config('app.timezone'))
    ->description('Clean up visitor records older than 24 hours');

// Reset expired service discounts back to their defaults
Schedule::command('discounts:reset-expired')->everyMinute();
