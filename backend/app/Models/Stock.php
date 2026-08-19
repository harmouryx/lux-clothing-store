<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['product_id_variant', 'quantity'])]
class Stock extends Model
{
    use HasFactory;

    // RELATIONSHIP BETWEEN PRODUCT VARAINT TABLE

    // The stock  is  related to one single product and its variants
    public function variant(): BelongsTo
    {
        return $this->belongsTo(ProductVariants::class, 'product_id_variant', 'id');
    }
}
