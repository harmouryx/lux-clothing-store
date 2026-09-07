<?php

require 'vendor/autoload.php';
$app = require 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

// Seed payment methods if empty
$count = App\Models\PaymentMethods::count();
if ($count === 0) {
    App\Models\PaymentMethods::insert([
        [
            'payment_method_name' => 'Credit / Debit Card',
            'code' => 'CARD',
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ],
        [
            'payment_method_name' => 'PayPal',
            'code' => 'PAYPAL',
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ],
        [
            'payment_method_name' => 'Bank Transfer',
            'code' => 'BANK_TRANSFER',
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ],
    ]);
    echo "Payment methods seeded.\n";
} else {
    echo "Payment methods already exist ($count rows).\n";
}

$pm = App\Models\PaymentMethods::all();
echo json_encode($pm->toArray(), JSON_PRETTY_PRINT) . "\n";
