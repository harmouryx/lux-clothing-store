<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\ProductVariants;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class OrdersController extends Controller
{
    /**
     * Display a listing of the orders.
     * Admin gets all orders; regular clients get their own orders.
     */
    public function index(Request $request)
    {
        $user = $request->user();

        if (! $user) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthenticated',
            ], 401);
        }

        $query = Order::with(['details.productVariant.product', 'payment', 'user'])->latest();

        if (! $user->hasRole('admin')) {
            $query->where('user_id', $user->id);
        }

        $orders = $query->get();

        return response()->json([
            'success' => true,
            'data' => $orders,
        ], 200);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $user = $request->user();

        if (! $user || (! $user->hasRole('user') && ! $user->hasRole('admin'))) {
            return response()->json([
                'message' => 'Unauthorized to shop. Please log in or create an account first.',
            ], 403);
        }

        $validated = $request->validate([
            'payment_method_id' => ['required', 'exists:payment_methods,id'],
            'payment_reference' => ['nullable', 'string', 'max:255'],
            'shipping_info' => ['required', 'array'],
            'shipping_info.firstName' => ['required', 'string'],
            'shipping_info.lastName' => ['required', 'string'],
            'shipping_info.country' => ['required', 'string'],
            'shipping_info.streetAddress' => ['required', 'string'],
            'shipping_info.city' => ['required', 'string'],
            'shipping_info.taxId' => ['nullable', 'string', 'max:255'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.product_variant_id' => ['required', 'exists:product_variants,id'],
            'items.*.quantity' => ['required', 'integer', 'min:1'],
        ]);

        try {
            $order = DB::transaction(function () use ($user, $validated) {
                $itemsToProcess = [];

                foreach ($validated['items'] as $item) {
                    $variant = ProductVariants::with(['stock', 'product.tax'])
                        ->findOrFail($item['product_variant_id']);

                    if (! $variant->stock || $variant->stock->quantity < $item['quantity']) {
                        throw ValidationException::withMessages([
                            'items' => ['Insufficient stock for variant: '.$variant->id],
                        ]);
                    }

                    $itemsToProcess[] = [
                        'variant' => $variant,
                        'quantity' => (int) $item['quantity'],
                    ];
                }

                $total = 0;

                $order = Order::create([
                    'user_id' => $user->id,
                    'payment_method_id' => $validated['payment_method_id'],
                    'payment_reference' => $validated['payment_reference'] ?? null,
                    'total_amount' => 0,
                    'status' => 'PENDING',
                    'shipping_info' => $validated['shipping_info'],
                ]);

                foreach ($itemsToProcess as $entry) {
                    $variant = $entry['variant'];
                    $quantity = $entry['quantity'];

                    $unitPrice = (float) $variant->product->base_price;
                    $subtotal = $unitPrice * $quantity;
                    $taxPercentage = (float) ($variant->product->tax?->tax_percentage ?? 0);
                    $taxAmount = $subtotal * ($taxPercentage / 100);
                    $lineTotal = $subtotal + $taxAmount;

                    $total += $lineTotal;

                    $order->details()->create([
                        'product_variant_id' => $variant->id,
                        'product_info' => [
                            'product_id' => $variant->fk_product_id,
                            'sku' => $variant->sku,
                            'attributes' => $variant->attributes,
                        ],
                        'quantity' => $quantity,
                        'unit_price' => $unitPrice,
                        'tax_amount' => $taxAmount,
                    ]);

                    $variant->stock->decrement('quantity', $quantity);
                }

                $order->update(['total_amount' => $total]);

                return $order->load(['details.productVariant.product', 'payment', 'user']);
            });

            return response()->json([
                'success' => true,
                'message' => 'Order created successfully and labeled as PENDING.',
                'data' => $order,
            ], 201);
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Order validation failed.',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => 'An unexpected error occurred while creating the order.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Show a single order.
     */
    public function show(Request $request, Order $order)
    {
        $user = $request->user();

        if (! $user || (! $user->hasRole('admin') && $order->user_id !== $user->id)) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized to view this order.',
            ], 403);
        }

        return response()->json([
            'success' => true,
            'data' => $order->load(['details.productVariant.product', 'payment', 'user']),
        ], 200);
    }

    /**
     * Mark an order as paid after a simulated payment confirmation.
     */
    public function markAsPaid(Request $request, Order $order)
    {
        $user = $request->user();

        if (! $user || (! $user->hasRole('admin') && $order->user_id !== $user->id)) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized to update this order',
            ], 403);
        }

        if ($order->status === 'PAID') {
            return response()->json([
                'success' => true,
                'message' => 'Order is already labeled as PAID',
                'data' => $order,
            ], 200);
        }

        if ($order->status === 'SHIPPED') {
            return response()->json([
                'success' => false,
                'message' => 'This order has already been shipped and cannot be named as PAID again',
            ], 409);
        }

        $order->update(['status' => 'PAID']);

        return response()->json([
            'success' => true,
            'message' => 'Order was PAID',
            'data' => $order->fresh(['details.productVariant.product', 'payment', 'user']),
        ], 200);
    }

    /**
     * Mark an order as shipped after delivery simulation.
     */
    public function markAsShipped(Request $request, Order $order)
    {
        $user = $request->user();

        if (! $user || (! $user->hasRole('admin') && $order->user_id !== $user->id)) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized to update this order',
            ], 403);
        }

        if ($order->status === 'SHIPPED') {
            return response()->json([
                'success' => true,
                'message' => 'Order is already labeled as SHIPPED',
                'data' => $order,
            ], 200);
        }

        if ($order->status !== 'PAID') {
            return response()->json([
                'success' => false,
                'message' => 'Only PAID orders can be labeled as SHIPPED',
            ], 409);
        }

        $order->update(['status' => 'SHIPPED']);

        return response()->json([
            'success' => true,
            'message' => 'Order was SHIPPED.',
            'data' => $order->fresh(['details.productVariant.product', 'payment', 'user']),
        ], 200);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Order $orders)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Order $orders)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Order $shopping)
    {
        //
    }
}
