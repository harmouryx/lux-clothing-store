<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Casts\AsArrayObject;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['order_id', 'product_variant_id', 'product_info', 'quantity', 'unit_price', 'tax_amount'])]
class OrderDetails extends Model
{
    use HasFactory;

    protected function casts(): array
    {
        return [
            'product_info' => AsArrayObject::class,
        ];
    }

    // RELATIONSHIP BETWEEN ORDERS TABLE

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class, 'order_id');
    }

    // RELATIONSHIP BETWEEN PRODUCT VARIANT TABLE

    public function productVariant(): BelongsTo
    {
        return $this->belongsTo(ProductVariants::class, 'product_variant_id');
    }
}
