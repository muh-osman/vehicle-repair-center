<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\UserController;



Route::get('/', function () {
    return view('welcome');
});




// This route will run the jobs in job table (https://cashif.cc/payment-system/back-end/public/test-queue)

// Route::get('/test-queue', function () {
//     \Artisan::call('queue:work', [
//         '--stop-when-empty' => true,
//         '--timeout' => '90',
//     ]);
//     return 'done: ' . \Artisan::output();
// });




//  This route will tell you exactly which PHP 8.2 binary exists on your server — use whichever shows EXISTS ✅ in the cron command in hostinger cron job (https://cashif.cc/payment-system/back-end/public/test-path)

// Route::get('/test-path', function () {
//     $paths = [
//         '/opt/alt/php82/usr/bin/php',
//         '/opt/alt/php82/usr/bin/php82',
//         '/usr/bin/php82',
//         '/usr/local/bin/php82',
//         '/usr/bin/php8.2',
//         '/usr/local/bin/php8.2',
//     ];

//     $results = [];
//     foreach ($paths as $path) {
//         $results[$path] = file_exists($path) ? 'EXISTS ✅' : 'not found ❌';
//     }

//     return $results;
// });