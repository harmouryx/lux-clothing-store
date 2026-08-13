<?php


use Illuminate\Support\Facades\Route;
use Laravel\Fortify\Http\Controllers\AuthenticatedSessionController;
use Laravel\Fortify\Http\Controllers\RegisteredUserController;
use Laravel\Fortify\RoutePath;
use Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful;

    Route::get('/', function () {
        return response()->json(['message' => 'Welcome to the API']);
    });

Route::group(['middleware' => EnsureFrontendRequestsAreStateful::class, 'web'] , function () {

    $limiter = config('fortify.limiters.login');
    $twoFactorLimiter = config('fortify.limiters.two-factor');
    $passkeyLimiter = config('fortify.limiters.passkeys');
       
    
    Route::post(RoutePath::for('login', '/login'), [AuthenticatedSessionController::class, 'store'])
        ->middleware(array_filter([
            'guest:'.config('fortify.guard'),
            $limiter ? 'throttle:'.$limiter : null,
        ]))->name('login.store');

        
        Route::post(RoutePath::for('register', '/register'), [RegisteredUserController::class, 'store'])
            ->middleware(['guest:'.config('fortify.guard')])
            ->name('register.store');
});
