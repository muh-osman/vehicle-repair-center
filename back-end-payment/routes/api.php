<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\UserController;
use App\Http\Controllers\PaidQrCodeController;
use App\Http\Controllers\UnPaidQrCodeController;
use App\Http\Controllers\TabbyPaidClientController;
use App\Http\Controllers\TamaraPaidClientController;
use App\Http\Controllers\MoyasarShippingPaymentController;




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


    Route::post('/save-paid-qr-code', [PaidQrCodeController::class, 'store']);
    Route::post('/purchase-check-moyasar-webhook', [PaidQrCodeController::class, 'purchaseCheckMoyasarWebhook']);

    Route::post('/save-unpaid-qr-code', [UnPaidQrCodeController::class, 'store']);

    // Tamara Payment Route
    Route::post('/pay-with-tamara', [TamaraPaidClientController::class, 'processPayment']); // cerate checkout url using Tamara api
    Route::post('/tamara-authorize-webhook', [TamaraPaidClientController::class, 'authorizeWebhook']); // convert Tamara order from "approved" to "authorized"
    Route::post('/tamara-capture-webhook', [TamaraPaidClientController::class, 'captureWebhook']); // convert Tamara order from "authorized" to "captured"
    Route::post('/tamara-store-webhook', [TamaraPaidClientController::class, 'storeInDb']); // Store captured order in database


    // Tabby Payment Route
    Route::post('/pay-with-tabby', [TabbyPaidClientController::class, 'processPayment']); // cerate checkout url using Tabby api
    Route::post('/tabby-webhooks', [TabbyPaidClientController::class, 'tabbyWebhook']); // Tabby webhook



    // Dashboard api (cashif.online)
    Route::get('/get-paid-payment/{id}', [PaidQrCodeController::class, 'show']); // Moyasar
    Route::get('/get-unpaid-payment/{id}', [UnPaidQrCodeController::class, 'show']); // Unpaid
    Route::get('/get-tamara-paid-client/{id}', [TamaraPaidClientController::class, 'show']); // Tamara
    Route::get('/get-tabby-paid-client/{id}', [TabbyPaidClientController::class, 'show']); // Tabby

    Route::delete('/delete-client/{qrCode}', [UnPaidQrCodeController::class, 'deleteClient']); // Delete the client

    Route::get('/get-all-clients-paid-and-unpaid', [UnPaidQrCodeController::class, 'getAllQrCodes']);
    Route::get('/get-all-mertah-service-records', [UnPaidQrCodeController::class, 'getAllQrCodesWithSpecialService']); // مرتاح
    Route::get('/get-all-phones-with-their-qr-codes', [UnPaidQrCodeController::class, 'getAllPhonesWithQrCodes']);

    Route::get('/orders/monthly-count-last-12-months', [UnPaidQrCodeController::class, 'getOrdersCountLast12Months']);


    // Shipping payments Webhook
    // Route::post('/shipping-payment-paid-webhook', [MoyasarShippingPaymentController::class, 'ShippingPaymentPaidWebhook']);
    Route::post('/store-shipping-car-order', [MoyasarShippingPaymentController::class, 'storeShippingCarOrder']);
    // Get all shipping payments
    Route::get('/shipping-payments', [MoyasarShippingPaymentController::class, 'getAllShippingPayments']);
    Route::get('/get-shipping-payment/{id}', [MoyasarShippingPaymentController::class, 'show']);
    Route::put('/shipping-payments/mark-as-shipped/{id}', [MoyasarShippingPaymentController::class, 'markAsShipped']);
    Route::put('/shipping-payments/update_accounted_status/{id}', [MoyasarShippingPaymentController::class, 'markAsAccounted']);
    Route::put('/shipping-payments/update_note/{id}', [MoyasarShippingPaymentController::class, 'updateNote']);

    // Mertah
    // For the first method (only paid tables)
    Route::put('/mertah-service/toggle-is-shipped/{qrCode}', [UnPaidQrCodeController::class, 'toggleShippedStatus']);
    // Route for finding record in payment tables only
    Route::get('/get-mertah-client/debends-on-qr-code/{qrCode}', [UnPaidQrCodeController::class, 'findRecordByQrCode']);
});
