<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OrderDetails extends Model
{
    use HasFactory;

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
