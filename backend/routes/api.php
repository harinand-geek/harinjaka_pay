<?php

use App\Http\Controllers\Api\AnalyticsController;
use App\Http\Controllers\Api\PublicPaymentMethodController;
use App\Http\Controllers\Api\SettingsController;
use App\Http\Controllers\Api\Admin\AdminAnalyticsController;
use App\Http\Controllers\Api\Admin\AuthController;
use App\Http\Controllers\Api\Admin\PaymentMethodController;
use App\Http\Controllers\Api\Admin\SettingsController as AdminSettingsController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Public API
|--------------------------------------------------------------------------
*/
Route::get('/payment-methods', [PublicPaymentMethodController::class, 'index']);
Route::get('/settings', [SettingsController::class, 'index']);

// Analytics ingestion — rate limited to deter abuse/spam.
Route::middleware('throttle:analytics')->group(function () {
    Route::post('/analytics/visit', [AnalyticsController::class, 'storeVisit']);
    Route::post('/analytics/payment-event', [AnalyticsController::class, 'storeEvent']);
});

/*
|--------------------------------------------------------------------------
| Admin API
|--------------------------------------------------------------------------
*/
Route::prefix('admin')->group(function () {
    // Public auth endpoint (login) — throttled against brute force.
    Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:login');

    // Protected: requires a valid Sanctum token + admin flag.
    Route::middleware(['auth:sanctum', 'admin'])->group(function () {
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::get('/me', [AuthController::class, 'me']);
        Route::put('/profile', [AuthController::class, 'updateProfile']);

        // Payment methods — reorder/toggle declared before the apiResource so
        // "reorder" is not captured as a {paymentMethod} model binding.
        Route::patch('/payment-methods/reorder', [PaymentMethodController::class, 'reorder']);
        Route::patch('/payment-methods/{paymentMethod}/toggle', [PaymentMethodController::class, 'toggle']);
        Route::post('/payment-methods/{paymentMethod}/logo', [PaymentMethodController::class, 'uploadLogo']);
        Route::delete('/payment-methods/{paymentMethod}/logo', [PaymentMethodController::class, 'deleteLogo']);
        Route::apiResource('/payment-methods', PaymentMethodController::class)
            ->parameters(['payment-methods' => 'paymentMethod']);

        // Settings
        Route::get('/settings', [AdminSettingsController::class, 'index']);
        Route::put('/settings', [AdminSettingsController::class, 'update']);

        // Analytics
        Route::prefix('analytics')->group(function () {
            Route::get('/overview', [AdminAnalyticsController::class, 'overview']);
            Route::get('/visits', [AdminAnalyticsController::class, 'visits']);
            Route::get('/payment-methods', [AdminAnalyticsController::class, 'paymentMethods']);
            Route::get('/locations', [AdminAnalyticsController::class, 'locations']);
            Route::get('/devices', [AdminAnalyticsController::class, 'devices']);
            Route::get('/referrers', [AdminAnalyticsController::class, 'referrers']);
        });
    });
});
