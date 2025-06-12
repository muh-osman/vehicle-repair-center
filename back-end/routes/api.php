<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\PostController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\PriceController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\CountryController;
use App\Http\Controllers\ServiceController;
use App\Http\Controllers\CarModelController;
use App\Http\Controllers\PhoneNumberController;

use App\Http\Controllers\ManufacturerController;
use App\Http\Controllers\MarketingPostController;
use App\Http\Controllers\YearOfManufactureController;



// Group for protected routes
Route::middleware('auth:sanctum')->group(function () {

    // Return the authenticated user and his token (http://localhost:8000/api/user)
    Route::get('user', function (Request $request) {
        return [
            'user' => $request->user(),
            'currentToken' => $request->bearerToken()
        ];
    });

    // Logout Route (http://localhost:8000/api/logout)
    Route::post('/logout', [UserController::class, 'logout']);


    // Resend verification email (http://localhost:8000/api/resend-verify-email)
    Route::post('/resend-verify-email', [UserController::class, 'resendVerifyEmail']);


    // Show all posts:      method GET    =>  http://localhost:8000/api/posts
    // Create post:         method POST   =>  http://localhost:8000/api/posts
    // Show post by id:     method GET    =>  http://localhost:8000/api/posts/1
    // Update post by id:   method POST   =>  http://localhost:8000/api/posts/1?_method=PATCH
    // Delete post by id:   method DELETE =>  http://localhost:8000/api/posts/1
    Route::apiResource('posts', PostController::class);

    // Countries Resource Routes
    Route::apiResource('countries', CountryController::class);
    // Manufacturers Resource Routes
    Route::apiResource('manufacturers', ManufacturerController::class);
    // Get Manufacturers By Country ID
    Route::get('manufacturers/by-country/{countryId}', [ManufacturerController::class, 'getManufacturersByCountry']);
    // Car Models Resource Routes
    Route::apiResource('car-models', CarModelController::class);
    // Get car models by manufacturer ID
    Route::get('car-models/by-manufacturer/{manufacturerId}', [CarModelController::class, 'getModelsByManufacturerId']);
    // Year of Manufacture Resource Routes
    Route::apiResource('year-of-manufacture', YearOfManufactureController::class);
    // Get Years by car model ID
    Route::get('years/by-model/{carModelId}', [YearOfManufactureController::class, 'getYearsByCarModel']);
    // Services Resource Routes
    Route::apiResource('services', ServiceController::class);
    // Prices Resource Routes
    Route::apiResource('prices', PriceController::class);
    //  GetPrice method
    Route::get('get-price', [PriceController::class, 'getPrice']);
    // Search car models (by first letter)
    Route::post('car-models/search', [CarModelController::class, 'searchModels']);


    // Accepted Phone Numbers (for reports dashboard)
    Route::post('post-accepted-phone-number', [PhoneNumberController::class, 'store']);
    Route::delete('delete-accepted-phone-number/{id}', [PhoneNumberController::class, 'destroy']);

    // PDF Report
    Route::post('post-pdf-report', [ReportController::class, 'store']);
    Route::get('get-all-pdf-reports', [ReportController::class, 'index']);
    Route::delete('delete-report/{id}', [ReportController::class, 'destroy']);



    // Create a new marketing post
    Route::post('post/marketing-posts', [MarketingPostController::class, 'store']);
    // Delete a marketing post
    Route::delete('delete/marketing-posts/{id}', [MarketingPostController::class, 'destroy']);
});


// Group for guest routes
Route::middleware('guest')->group(function () {
    // Register Route (http://localhost:8000/api/register)
    Route::post('/register', [UserController::class, 'register']);

    // Login Route (http://localhost:8000/api/login)
    Route::post('/login', [UserController::class, 'login']);

    // Email verification endpoint (http://localhost:8000/api/verify-email)
    Route::post('/verify-email', [UserController::class, 'verifyEmail'])->name('verification.verify');

    // Password Reset Route (http://localhost:8000/api/forgot-password)
    Route::post('/forgot-password', [UserController::class, 'forgotPassword'])->name('password.email');

    // API route for resetting the password (http://localhost:8000/api/reset-password)
    Route::post('/reset-password', [UserController::class, 'resetPassword'])->name('password.reset');

    // Search car models (by any letter also limited with 10 result)
    Route::post('car-models/limited-general-search', [CarModelController::class, 'searchModelsLimited']);

    // Get All car models
    Route::get('all-car-models', [CarModelController::class, 'index']);

    // Getting prices by car model ID and year ID
    Route::get('get-prices-by-model-and-year', [PriceController::class, 'getPricesByModelAndYear']);

    // Getting discounted prices by car model ID and year ID
    Route::get('get-discounted-prices-by-model-and-year', [PriceController::class, 'getDiscountedPricesByModelAndYear']);

    // Getting discounted prices by car model ID and year ID (discounte 50%)
    Route::get('get-fifty-precent-discounted-prices-by-model-and-year', [PriceController::class, 'getAllPlansWith50PercentDiscount']);

    // Mshrai App
    Route::get('all-manufacturers', [ManufacturerController::class, 'allManufacturers']);
    Route::get('all-models-by-manufacture-id/{manufactureId}', [CarModelController::class, 'allModelsByManufactureId']);
    Route::get('all-plans-prices-by-model-id/{modelId}/and-year-id/{yearId}', [PriceController::class, 'forMshraiAppGetDiscountedPricesByModelAndYear']);


    // Accepted Phone Numbers (for reports dashboard)
    Route::get('get-all-accepted-phone-numbers', [PhoneNumberController::class, 'index']);
    // // Get all marketing posts
    Route::get('get-all/marketing-posts', [MarketingPostController::class, 'index']);
    // Get all marketing posts (return images as file)
    Route::get('marketing-posts/with-images-as-files', [MarketingPostController::class, 'indexWithImages']);


    // PDF Report
    Route::get('get-all-summary-reports-numbers', [ReportController::class, 'showArrayOfSummaryReportsNumbers']);
    Route::get('download-summary-report/{report_number}', [ReportController::class, 'downloadSummaryReport']);
});
