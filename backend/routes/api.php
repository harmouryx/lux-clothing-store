<?php

use Illuminate\Support\Facades\Route;
use Laravel\Fortify\Http\Controllers\AuthenticatedSessionController;
use Laravel\Fortify\Http\Controllers\RegisteredUserController;
use Laravel\Fortify\RoutePath;


Route::group(['middleware' =>  ['api']] , function () {
    
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
});
