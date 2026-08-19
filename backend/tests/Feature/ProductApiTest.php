<?php

namespace Tests\Feature;

use App\Models\Tax;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProductApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_creates_a_product_with_variants_and_stock(): void
    {
        $tax = Tax::create([
            'name' => 'IVA 19%',
            'tax_percentage' => 19.00,
            'is_active' => true,
        ]);

        $payload = [
            'name' => 'Camisa Classic',
            'base_price' => '99.99',
            'tax_applied_id' => $tax->id,
            'product_variants' => [
                [
                    'sku' => 'CAMISA-M-001',
                    'attributes' => [
                        'size' => 'M',
                        'color' => 'blue',
                        'description' => 'Cotton premium',
                    ],
                    'quantity' => 12,
                ],
                [
                    'sku' => 'CAMISA-L-001',
                    'attributes' => [
                        'size' => 'L',
                        'color' => 'red',
                    ],
                    'quantity' => 5,
                ],
            ],
        ];

        $response = $this->postJson('/api/products', $payload);

        $response->assertStatus(201)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.name', 'Camisa Classic')
            ->assertJsonPath('data.tax.id', $tax->id)
            ->assertJsonFragment(['sku' => 'CAMISA-M-001']);
    }

    public function test_it_lists_products_with_tax_and_variants(): void
    {
        $tax = Tax::create([
            'name' => 'IVA 19%',
            'tax_percentage' => 19.00,
            'is_active' => true,
        ]);

        $this->postJson('/api/products', [
            'name' => 'Pantalon Slim',
            'base_price' => '149.90',
            'tax_applied_id' => $tax->id,
            'product_variants' => [
                [
                    'sku' => 'PANTALON-32-001',
                    'attributes' => [
                        'size' => '32',
                        'color' => 'black',
                    ],
                    'quantity' => 8,
                ],
            ],
        ])->assertStatus(201);

        $response = $this->getJson('/api/products');

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonFragment(['name' => 'Pantalon Slim'])
            ->assertJsonFragment(['sku' => 'PANTALON-32-001']);
    }

    public function test_it_rejects_product_creation_without_variants(): void
    {
        $tax = Tax::create([
            'name' => 'IVA 19%',
            'tax_percentage' => 19.00,
            'is_active' => true,
        ]);

        $response = $this->postJson('/api/products', [
            'name' => 'Invalid Product',
            'base_price' => '49.99',
            'tax_applied_id' => $tax->id,
            'product_variants' => [],
        ]);

        $response->assertStatus(422);
    }
}
