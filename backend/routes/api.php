<?php

use App\Http\Controllers\API\OrdersController;
use App\Http\Controllers\API\ProductController;
use App\Http\Controllers\API\ProductVariantsController;
use App\Http\Controllers\API\StockController;
use App\Http\Controllers\API\TaxController;
use Illuminate\Support\Facades\Route;
use Laravel\Fortify\Http\Controllers\AuthenticatedSessionController;
use Laravel\Fortify\Http\Controllers\RegisteredUserController;
use Laravel\Fortify\RoutePath;

Route::group(['middleware' => ['api']], function () {

    $limiter = config('fortify.limiters.login');
    $twoFactorLimiter = config('fortify.limiters.two-factor');
    $passkeyLimiter = config('fortify.limiters.passkeys');

    Route::get('/', function () {
        return response()->json(['message' => 'Welcome to the API']);
    });

    Route::post(RoutePath::for('login', '/login'), [AuthenticatedSessionController::class, 'store'])
        ->middleware(array_filter([
            'auth:sanctum',
            $limiter ? 'throttle:'.$limiter : null,
        ]))
        ->name('login.store');

    Route::post(RoutePath::for('register', '/register'), [RegisteredUserController::class, 'store'])
        ->middleware(array_filter(
            ['auth:sanctum']
        ))
        ->name('register.store');

    // Resources Routes CRUDS for the entire ecommerce
    Route::post('orders', [OrdersController::class, 'store']);
    Route::get('orders/{order}', [OrdersController::class, 'show']);
    Route::patch('orders/{order}/pay', [OrdersController::class, 'markAsPaid']);
    Route::patch('orders/{order}/ship', [OrdersController::class, 'markAsShipped']);

    Route::apiResource('products', ProductController::class);
    Route::apiResource('taxes', TaxController::class);

    Route::apiResource('stock', StockController::class)
        ->only(['destroy']);

    Route::patch('product-variants/{productVariant}/stock', [StockController::class, 'update']);

    Route::apiResource('product-variants', ProductVariantsController::class)
        ->only(['update', 'destroy'])
        ->parameters(['product-variants' => 'productVariants']);

});
