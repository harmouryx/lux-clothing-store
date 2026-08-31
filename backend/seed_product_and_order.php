<?php

require 'vendor/autoload.php';
$app = require 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

// Verify Dylan user email so he can shop
$dylan = App\Models\User::where('email', 'dyleon@example.com')->first();
if ($dylan && !$dylan->email_verified_at) {
    $dylan->email_verified_at = now();
    $dylan->save();
    echo "Dylan email verified.\n";
}

// Get admin user
$admin = App\Models\User::where('email', 'adminlux@example.com')->first();

if (!$admin) {
    echo "Admin not found!\n";
    exit(1);
}

// Get tax
$tax = App\Models\Tax::first();
if (!$tax) {
    echo "No tax found!\n";
    exit(1);
}

// Check if product already exists
$existing = App\Models\Product::where('name', 'Camiseta ArchiveSky')->first();
if ($existing) {
    echo "Product already exists: " . $existing->id . "\n";
    $product = $existing;
} else {
    // Create product
    $product = App\Models\Product::create([
        'name' => 'Camiseta ArchiveSky',
        'base_price' => 15.00,
        'tax_applied_id' => $tax->id,
    ]);
    echo "Product created: " . $product->id . "\n";
}

// Create variants (sizes S, M, L)
$sizes = [
    ['sku' => 'ARCH-S-BLK', 'size' => 'S', 'stock' => 25],
    ['sku' => 'ARCH-M-BLK', 'size' => 'M', 'stock' => 30],
    ['sku' => 'ARCH-L-BLK', 'size' => 'L', 'stock' => 20],
];

foreach ($sizes as $s) {
    $existingVariant = App\Models\ProductVariants::where('sku', $s['sku'])->first();
    if (!$existingVariant) {
        $variant = App\Models\ProductVariants::create([
            'fk_product_id' => $product->id,
            'sku' => $s['sku'],
            'attributes' => ['size' => $s['size'], 'color' => 'Black', 'description' => 'Premium cotton streetwear tee'],
        ]);
        // Create stock for variant
        App\Models\Stock::create([
            'product_id_variant' => $variant->id,
            'quantity' => $s['stock'],
        ]);
        echo "Variant {$s['sku']} created with stock {$s['stock']}.\n";
    } else {
        echo "Variant {$s['sku']} already exists.\n";
    }
}

// Reload product with relations
$product = App\Models\Product::with(['variants.stock', 'tax'])->find($product->id);
echo "\n=== PRODUCT CREATED ===\n";
echo json_encode($product->toArray(), JSON_PRETTY_PRINT) . "\n";

// Simulate order from paula.buendia
$paula = App\Models\User::where('email', 'paula.buendia@example.com')->first();
$variant = $product->variants->first();
$paymentMethod = App\Models\PaymentMethods::first();

if ($paula && $variant && $variant->stock && $variant->stock->quantity > 0 && $paymentMethod) {
    $order = App\Models\Order::create([
        'user_id' => $paula->id,
        'payment_method_id' => $paymentMethod->id,
        'payment_reference' => 'CARD-TEST-ARCHIVESKY',
        'total_amount' => 0,
        'status' => 'PENDING',
        'shipping_info' => [
            'firstName' => 'Paula',
            'lastName' => 'Buendia',
            'country' => 'Colombia',
            'streetAddress' => 'Calle 123 #45-67',
            'city' => 'Bogota',
            'taxId' => 'CC-123456789',
        ],
    ]);

    $unitPrice = (float) $variant->product->base_price;
    $taxPct = (float) ($variant->product->tax?->tax_percentage ?? 0);
    $taxAmt = $unitPrice * ($taxPct / 100);
    $lineTotal = $unitPrice + $taxAmt;

    $order->details()->create([
        'product_variant_id' => $variant->id,
        'product_info' => [
            'product_id' => $variant->fk_product_id,
            'sku' => $variant->sku,
            'attributes' => $variant->attributes,
        ],
        'quantity' => 1,
        'unit_price' => $unitPrice,
        'tax_amount' => $taxAmt,
    ]);

    $variant->stock->decrement('quantity', 1);
    $order->update(['total_amount' => $lineTotal]);

    echo "\n=== ORDER CREATED ===\n";
    $order = $order->load(['details.productVariant.product', 'payment', 'user']);
    echo json_encode($order->toArray(), JSON_PRETTY_PRINT) . "\n";
} else {
    echo "Could not create test order: missing data.\n";
    echo "Paula: " . ($paula ? 'found' : 'not found') . "\n";
    echo "Variant: " . ($variant ? 'found' : 'not found') . "\n";
    echo "Stock: " . ($variant && $variant->stock ? $variant->stock->quantity : 'none') . "\n";
    echo "PaymentMethod: " . ($paymentMethod ? 'found' : 'not found') . "\n";
}
