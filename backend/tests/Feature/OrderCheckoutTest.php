<?php

namespace Tests\Feature;

use App\Models\PaymentMethods;
use App\Models\Product;
use App\Models\ProductVariants;
use App\Models\Stock;
use App\Models\Tax;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class OrderCheckoutTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_create_order_when_stock_is_available(): void
    {
        Role::firstOrCreate(['name' => 'user']);

        $user = User::factory()->create();
        $user->assignRole('user');

        $paymentMethod = PaymentMethods::create([
            'payment_method_name' => 'Visa',
            'code' => 'visa',
            'is_active' => true,
        ]);

        $tax = Tax::create([
            'name' => 'IVA',
            'tax_percentage' => 16,
            'is_active' => true,
        ]);

        $product = Product::create([
            'name' => 'Camisa X',
            'base_price' => 100.00,
            'tax_applied_id' => $tax->id,
        ]);

        $variant = ProductVariants::create([
            'fk_product_id' => $product->id,
            'sku' => 'SKU-001',
            'attributes' => ['size' => 'M', 'color' => 'blue'],
        ]);

        Stock::create([
            'product_id_variant' => $variant->id,
            'quantity' => 5,
        ]);

        $response = $this->actingAs($user)->postJson('/api/orders', [
            'payment_method_id' => $paymentMethod->id,
            'payment_reference' => 'REF-001',
            'shipping_info' => [
                'firstName' => 'Ana',
                'lastName' => 'García',
                'country' => 'MX',
                'streetAddress' => 'Calle 123',
                'city' => 'Guadalajara',
            ],
            'items' => [
                [
                    'product_variant_id' => $variant->id,
                    'quantity' => 2,
                ],
            ],
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('success', true);

        $this->assertDatabaseHas('orders', [
            'user_id' => $user->id,
        ]);

        $this->assertDatabaseHas('order_details', [
            'product_variant_id' => $variant->id,
            'quantity' => 2,
        ]);

        $variant->refresh();
        $this->assertEquals(3, $variant->stock->quantity);
    }

    public function test_user_cannot_create_order_when_stock_is_insufficient(): void
    {
        Role::firstOrCreate(['name' => 'user']);

        $user = User::factory()->create();
        $user->assignRole('user');

        $paymentMethod = PaymentMethods::create([
            'payment_method_name' => 'PayPal',
            'code' => 'paypal',
            'is_active' => true,
        ]);

        $tax = Tax::create([
            'name' => 'IVA',
            'tax_percentage' => 16,
            'is_active' => true,
        ]);

        $product = Product::create([
            'name' => 'Camisa Y',
            'base_price' => 120.00,
            'tax_applied_id' => $tax->id,
        ]);

        $variant = ProductVariants::create([
            'fk_product_id' => $product->id,
            'sku' => 'SKU-002',
            'attributes' => ['size' => 'L', 'color' => 'black'],
        ]);

        Stock::create([
            'product_id_variant' => $variant->id,
            'quantity' => 1,
        ]);

        $response = $this->actingAs($user)->postJson('/api/orders', [
            'payment_method_id' => $paymentMethod->id,
            'payment_reference' => 'REF-002',
            'shipping_info' => [
                'firstName' => 'Luis',
                'lastName' => 'Pérez',
                'country' => 'MX',
                'streetAddress' => 'Avenida 456',
                'city' => 'Monterrey',
            ],
            'items' => [
                [
                    'product_variant_id' => $variant->id,
                    'quantity' => 3,
                ],
            ],
        ]);

        $response->assertStatus(422)
            ->assertJsonPath('errors.items.0', 'Insufficient stock for variant: '.$variant->id);

        $this->assertDatabaseCount('orders', 0);
    }
}
