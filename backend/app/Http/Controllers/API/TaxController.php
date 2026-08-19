<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Tax;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class TaxController extends Controller
{
    //Set another tax as a default value 
    public function setDefaultTax(Tax $tax){
        
        Tax::where('is_default', true)->update(['is_default' => false]);

        $tax->update(['is_default'=> true]); 
       
        return response()->json([
        'success' => true,
        'message' => 'Default tax updated successfully',
        'data' => $tax
        ]);
    }

    /**
     * Display a listing of the resource.
     */
    public function index()
    {
    
    //Display all taxes with related products
    $taxes = Tax::with('products')->latest()->get();
        return response()->json([
            'success' => true,
            'data' => $taxes
        ]);
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
        //Validate info before storing a tax 
        $validated =  $request->validate([
            'name'=> ['required', 'string', 'max:255', 'unique:taxes,name'],
            'tax_percentage' => ['required', 'gte:0', 'decimal:0,2'],
        ]);

        $tax = Tax::create($validated);
        return response()->json([
            'success' => true,
            'message' => 'Tax created successfully',
            'data' => $tax
        ], 200);
    }

    /**
     * Display the specified resource.
     */
    public function show(Tax $tax)
    {
        
        //Display an specific tax with its product
        $tax->load('products');
        
        return response()->json([
            'success' => true,
            'data' => $tax 
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
    public function update(Request $request, Tax $tax)
    {
        //Update Tax  info 
        $validated = $request->validate([
            'name'=> ['required', 'string', 'max:255',Rule::unique('taxes', 'name')->ignore($tax->id) ],
            'tax_percentage' => ['required', 'gte:0', 'decimal:0,2'],
        ]);


        $tax->update($validated);
        return response()->json([
            'success' => true,
            'message' => 'Tax updated successfully',
            'data' => $tax
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Tax $tax)
    {
        $tax->delete();

        return response()->json(['success'=> true, 'message'=> 'Tax removed succesfully'], 200);

    }
}
