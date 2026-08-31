<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\ProductVariants;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class ProductVariantsController extends Controller
{
    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, ProductVariants $productVariants)
    {
        $validated = $request->validate([
            'sku' => ['sometimes', 'string', 'max:255', Rule::unique('product_variants', 'sku')->ignore($productVariants->id)],
            'image_url' => ['sometimes', 'nullable', 'string', 'max:1024'],
            'attributes' => ['sometimes', 'array'],
            'attributes.size' => ['sometimes', 'nullable', 'string'],
            'attributes.color' => ['sometimes', 'nullable', 'string'],
            'attributes.description' => ['sometimes', 'nullable', 'string', 'max:255'],
        ]);

        if (array_key_exists('sku', $validated)) {
            $productVariants->sku = $validated['sku'];
        }

        if (array_key_exists('image_url', $validated)) {
            $productVariants->image_url = $validated['image_url'];
        }

        // Update 'attributes', only the ones included in the admin request
        if (array_key_exists('attributes', $validated)) {
            $currentAttributes = $productVariants->attributes;

            $currentAttributes = $currentAttributes instanceof \ArrayObject
                ? $currentAttributes->getArrayCopy()
                : (is_array($currentAttributes) ? $currentAttributes : []);

            $productVariants->attributes = array_replace(
                $currentAttributes,
                $validated['attributes']
            );
        }

        $productVariants->save();

        return response()->json([
            'success' => true,
            'message' => 'Product Variant Data updated successfully',
            'data' => $productVariants->load('stock'),
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(ProductVariants $productVariants)
    {
        $productVariants->delete();

        return response()->json(['success' => true, 'message' => 'Product variant data deleted successfully']);
    }
}
