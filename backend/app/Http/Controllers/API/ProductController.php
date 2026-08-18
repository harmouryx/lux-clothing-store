<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //Display all products inside of the database
        
        $products = Product::with('tax')->latest()->get();
        return response()->json([
            'success' => true,
            'data' => $products 
        ], 200);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create() 
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //Validate info before storing a product 
        $validated =  $request->validate([
            'name'=> ['required', 'string', 'max:255', 'unique:products,name'],
            'base_price' => ['required', 'gte:0', 'decimal:0,2'],
            'tax_applied_id' => ['required', 'integer', 'exists:taxes,id']
        ]); 

        $product = Product::create($validated);
        return response()->json([
            'success' => true,
            'message' => 'Product created successfully',
            'data' => $product
        ], 200);
    }

    /**
     * Display the specified resource.
     */
    public function show(Product $product)
    {
        $product->load('tax');
        return response()->json([
            'success' => true,
            'data' => $product 
        ], 200);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Product $product)
    {
        //Update the Product Base info , not the decription yet
        $validated = $request->validate([
            'name'=> ['required', 'string', 'max:255', 'unique:products,name'],
            'base_price' => ['required', 'gte:0', 'decimal:0,2'],
            'tax_applied_id' => ['required', 'integer', 'exists:taxes,id']            
        ]);

        $product->update($validated);
        return response()->json([
            'success' => true,
            'message' => 'Product updated successfully',
            'data' => $product
        ]);
        
    }
    /**

     * Remove the specified resource from storage.
     */
    public function destroy(Product $product)
    {
        $product->delete();

        return response()->json(['success'=> true, 'message'=> 'Product deleted succesfully'],200);
    }
}
