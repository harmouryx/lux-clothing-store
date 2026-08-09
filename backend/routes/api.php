<?php

use Illuminate\Support\Facades\Route;

use App\Http\Controllers\API\AuthenticationController;

/* PUBLIC API ROUTES FOR AUTHENTICATION (AUTH PREFIX)*/ 

Route::prefix('lux')->group(function() {
    Route::post('/signup', [AuthenticationController::class, 'signup']);
    Route::post('/login', [AuthenticationController::class, 'login']);
});

Route::get('/test', function() {
    return response()->json(['message' => 'API is working']);
});
    

/* PROTECTED ROTES FOR THE AUTHENTICATED USERS (AUTH PREFIX) */

Route::middleware('auth:sanctum')->group(function() {

     Route::prefix('auth')->group(function() {
            Route::get('/user', [AuthenticationController::class, 'userInfo']);
            Route::post('/logout', [AuthenticationController::class, 'logOut']);
    });

});