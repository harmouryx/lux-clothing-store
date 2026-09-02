<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UserController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $requester = $request->user();

        if (! $requester) {
            return response()->json(['success' => false, 'message' => 'Unauthenticated'], 401);
        }

        if (! $requester->hasRole('admin')) {
            return response()->json(['success' => false, 'message' => 'Forbidden'], 403);
        }

        $users = User::with('roles')
            ->withCount('orders')
            ->latest()
            ->get()
            ->map(fn (User $u) => [
                'id'                      => $u->id,
                'name'                    => $u->name,
                'last_name'               => $u->last_name,
                'email'                   => $u->email,
                'email_verified_at'       => $u->email_verified_at,
                'two_factor_confirmed_at' => $u->two_factor_confirmed_at,
                'created_at'              => $u->created_at,
                'orders_count'            => $u->orders_count,
                'roles'                   => $u->getRoleNames(),
            ]);

        return response()->json(['success' => true, 'data' => $users], 200);
    }
}
