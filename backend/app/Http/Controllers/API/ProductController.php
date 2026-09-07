<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class ProductController extends Controller
{
    /**
     * Display a listing of products with variants and tax.
     */
    public function index(): JsonResponse
    {
        $products = Product::with(['variants.stock', 'tax'])->latest()->get();

        return response()->json([
            'success' => true,
            'data' => $products,
        ], 200);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255', 'unique:products,name'],
            'base_price' => ['required', 'numeric', 'gte:0'],
            'tax_applied_id' => ['required', 'exists:taxes,id'],
            'image_url' => ['nullable', 'string'],
            'product_variants' => ['required', 'array', 'min:1'],
            'product_variants.*.sku' => ['required', 'string', 'unique:product_variants,sku'],
            'product_variants.*.attributes' => ['required', 'array'],
            'product_variants.*.attributes.size' => ['nullable', 'string'],
            'product_variants.*.attributes.color' => ['nullable', 'string'],
            'product_variants.*.attributes.description' => ['nullable', 'string'],
            'product_variants.*.image_url' => ['nullable', 'string'],
            'product_variants.*.quantity' => ['required', 'integer', 'min:0'],
        ]);

        $product = DB::transaction(function () use ($validated) {
            $product = Product::create([
                'name' => $validated['name'],
                'base_price' => $validated['base_price'],
                'tax_applied_id' => $validated['tax_applied_id'],
                'image_url' => $validated['image_url'] ?? null,
            ]);

            foreach ($validated['product_variants'] as $variantData) {
                $variant = $product->variants()->create([
                    'sku' => $variantData['sku'],
                    'attributes' => $variantData['attributes'],
                    'image_url' => $variantData['image_url'] ?? null,
                ]);

                $variant->stock()->create([
                    'quantity' => $variantData['quantity'],
                ]);
            }

            return $product->load(['variants.stock', 'tax']);
        });

        return response()->json([
            'success' => true,
            'message' => 'Product created successfully',
            'data' => $product,
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Product $product): JsonResponse
    {
        $product->load(['variants.stock', 'tax']);

        return response()->json([
            'success' => true,
            'data' => $product,
        ], 200);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Product $product): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['sometimes', 'string', 'max:255', Rule::unique('products', 'name')->ignore($product->id)],
            'base_price' => ['sometimes', 'numeric', 'gte:0'],
            'tax_applied_id' => ['sometimes', 'exists:taxes,id'],
            'image_url' => ['sometimes', 'nullable', 'string'],
        ]);

        $product->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Product updated successfully',
            'data' => $product,
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Product $product): JsonResponse
    {
        $product->delete();

        return response()->json(['success' => true, 'message' => 'Product deleted successfully'], 200);
    }
}
