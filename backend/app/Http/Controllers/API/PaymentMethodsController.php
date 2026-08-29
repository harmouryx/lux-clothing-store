<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\PaymentMethods;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class PaymentMethodsController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $paymentMethods = PaymentMethods::latest()->get();

        return response()->json([
            'success' => true,
            'data' => $paymentMethods,
        ], 200);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'payment_method_name' => ['required', 'string', 'max:255'],
            'code' => ['required', 'string', 'max:100', 'unique:payment_methods,code'],
            'is_active' => ['sometimes', 'boolean'],
        ]);

        $paymentMethod = PaymentMethods::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Payment method created successfully.',
            'data' => $paymentMethod,
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(PaymentMethods $paymentMethods)
    {
        return response()->json(['success' => true,
            'data' => $paymentMethods,
        ], 200);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, PaymentMethods $paymentMethods)
    {
        $validated = $request->validate([
            'payment_method_name' => ['sometimes', 'string', 'max:255'],
            'code' => ['sometimes', 'string', 'max:100', Rule::unique('payment_methods', 'code')->ignore($paymentMethods->id)],
            'is_active' => ['sometimes', 'boolean'],
        ]);

        $paymentMethods->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Payment method updated successfully.',
            'data' => $paymentMethods->fresh(),
        ], 200);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(PaymentMethods $paymentMethods)
    {
        $paymentMethods->delete();

        return response()->json([
            'success' => true,
            'message' => 'Payment method deleted successfully.',
        ], 200);
    }

    // DEFAULT PAYMENT METHOD

    public function setDefault(PaymentMethods $paymentMethod)
    {
        PaymentMethods::where('is_active', true)->update(['is_active' => false]);

        $paymentMethod->update([
            'is_active' => true,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Default payment method updated successfully.',
            'data' => $paymentMethod,
        ], 200);
    }
}
