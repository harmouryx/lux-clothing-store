<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        
    }
}

/* 

//// SCRIPT APRA NOTIFICACIONES IDK BRO 

View::composer('partials.topbar', function ($view) {
            if (!auth()->check()) {
                return;
            }
            $view->with([
                'notifications' => auth()->user()
                    ->notifications()
                    ->latest()
                    ->take(5)
                    ->get(),
                'unreadCount' => auth()->user()
                    ->unreadNotifications()
                    ->count(),
            ]);
        }); */