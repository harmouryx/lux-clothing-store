<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class ProductController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        // Display all products inside of the database

        $products = Product::with(['variants.stock', 'tax'])->latest()->get();

        return response()->json([
            'success' => true,
            'data' => $products,
        ], 200);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        // Validate info before storing a product
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255', 'unique:products,name'],
            'base_price' => ['required', 'gte:0', 'decimal:0,2'],
            'tax_applied_id' => 'required|exists:taxes,id',

            // VARIANTS OF A PRODUCT
            'product_variants' => ['required', 'array', 'min:1'],
            'product_variants.*.sku' => ['required', 'string', 'unique:product_variants,sku'],
            'product_variants.*.attributes' => ['required', 'array'],
            'product_variants.*.attributes.size' => ['required', 'string'],
            'product_variants.*.attributes.color' => ['nullable', 'string'],
            'product_variants.*.attributes.description' => ['nullable', 'string'],
            'product_variants.*.quantity' => ['required', 'integer', 'min:0'],
        ]);

        // Create Product with its tables *Product Variant, Stock and Tax *

        $product = DB::transaction(function () use ($validated) {

            // PRODUCTS TABLE

            $product = Product::create([
                'name' => $validated['name'],
                'base_price' => $validated['base_price'],
                'tax_applied_id' => $validated['tax_applied_id'],
            ]);

            foreach ($validated['product_variants'] as $variantData) {

                $variant = $product->variants()->create([
                    'sku' => $variantData['sku'],
                    'attributes' => $variantData['attributes'], // JSONB: size, color, description
                ]);

                $variant->stock()->create([
                    'quantity' => $variantData['quantity'],
                ]);
            }

            // Fetch product with its stock and tax to return it in the response
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
    public function show(Product $product)
    {
        // Display an specific product with its tax and stock
        $product->load(['variants.stock', 'tax']);

        return response()->json([
            'success' => true,
            'data' => $product,
        ], 200);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Product $product)
    {
        // Update the Product Base info , not the decription yet
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255', Rule::unique('products', 'name')->ignore($product->id)],
            'base_price' => ['required', 'gte:0', 'decimal:0,2'],
            'tax_applied_id' => ['sometimes', 'exists:taxes,id'],
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
    public function destroy(Product $product)
    {
        $product->delete();

        return response()->json(['success' => true, 'message' => 'Product deleted successfully'], 200);
    }
}
