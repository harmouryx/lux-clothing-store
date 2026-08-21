<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\ProductVariants;
use App\Models\Stock;
use Illuminate\Http\Request;

class StockController extends Controller
{
    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, ProductVariants $productVariant)
    {
        $validated = $request->validate([
            'quantity' => ['required', 'integer', 'min:0'],
        ]);

        $stock = $productVariant->stock()->updateOrCreate(
            [],
            ['quantity' => $validated['quantity']]
        );

        return response()->json([
            'success' => true,
            'message' => 'Stock updated succesfully',
            'data' => $stock,
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Stock $stock)
    {
        $stock->delete();

        return response()->json([
            'success' => true,
            'message' => 'Stock deleted succcessfully',
        ]);

    }
}
