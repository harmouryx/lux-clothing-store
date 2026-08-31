<?php

namespace App\Providers;

use App\Actions\Fortify\CreateNewUser;
use App\Actions\Fortify\ResetUserPassword;
use App\Actions\Fortify\UpdateUserPassword;
use App\Actions\Fortify\UpdateUserProfileInformation;
use App\Models\User;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Str;
use Laravel\Fortify\Actions\RedirectIfTwoFactorAuthenticatable;
use Laravel\Fortify\Contracts\LoginResponse;
use Laravel\Fortify\Contracts\LogoutResponse;
use Laravel\Fortify\Contracts\RegisterResponse;
use Laravel\Fortify\Fortify;

class FortifyServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        /* Standard JSON Responses for API / SPA Authentication */
        $this->app->instance(LoginResponse::class, new class implements LoginResponse {
            public function toResponse($request)
            {
                if ($request->wantsJson() || $request->isJson() || $request->header('X-Requested-With') === 'XMLHttpRequest' || $request->header('Accept') === 'application/json') {
                    $user = $request->user() ?: User::where('email', $request->input(Fortify::username()))->first();

                    return response()->json([
                        'message' => 'Login successful',
                        'token' => $user ? $user->createToken('auth-token')->plainTextToken : null,
                        'user' => $user ? $user->load('roles') : null,
                    ], 200);
                }

                return redirect()->intended(Fortify::redirects('login'));
            }
        });

        $this->app->instance(LogoutResponse::class, new class implements LogoutResponse {
            public function toResponse($request)
            {
                return response()->json([
                    'message' => 'Logout successful',
                ], 200);
            }
        });

        $this->app->instance(RegisterResponse::class, new class implements RegisterResponse {
            public function toResponse($request)
            {
                $user = $request->user() ?: User::where('email', $request->input('email'))->first();

                return $request->wantsJson()
                    ? response()->json([
                        'message' => 'Registration successful',
                        'token' => $user ? $user->createToken('auth-token')->plainTextToken : null,
                        'user' => $user ? $user->load('roles') : null,
                    ], 200)
                    : redirect()->intended(Fortify::redirects('register'));
            }
        });
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Fortify::createUsersUsing(CreateNewUser::class);
        Fortify::updateUserProfileInformationUsing(UpdateUserProfileInformation::class);
        Fortify::updateUserPasswordsUsing(UpdateUserPassword::class);
        Fortify::resetUserPasswordsUsing(ResetUserPassword::class);
        Fortify::redirectUserForTwoFactorAuthenticationUsing(RedirectIfTwoFactorAuthenticatable::class);

        // Strict DevSecOps Authentication: Query user by email and verify BCrypt hash securely
        Fortify::authenticateUsing(function (Request $request) {
            $email = trim($request->input(Fortify::username(), ''));
            $password = $request->input('password', '');

            if (empty($email) || empty($password)) {
                return null;
            }

            $user = User::where('email', $email)->first();

            if ($user && Hash::check($password, $user->password)) {
                return $user;
            }

            return null;
        });

        RateLimiter::for('login', function (Request $request) {
            $throttleKey = Str::transliterate(Str::lower($request->input(Fortify::username())).'|'.$request->ip());

            return Limit::perMinute(5)->by($throttleKey);
        });

        RateLimiter::for('two-factor', function (Request $request) {
            return Limit::perMinute(5)->by($request->session()->get('login.id'));
        });

        RateLimiter::for('passkeys', function (Request $request) {
            $credentialId = $request->input('credential.id');

            return Limit::perMinute(10)->by(
                ($credentialId ?: $request->session()->getId()).'|'.$request->ip()
            );
        });
    }
}