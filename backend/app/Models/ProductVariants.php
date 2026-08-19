<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Casts\AsArrayObject;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

#[Fillable(['fk_product_id', 'sku', 'attributes'])]
class ProductVariants extends Model
{
    use HasFactory;

    /**
     * Get the attributes that should be cast as array.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'attributes' => AsArrayObject::class,
        ];
    }

    // RELATIONSHIP BETWEEN VARIANTS AND PRODUCT

    // The variants of a single product are related to itself
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class, 'fk_product_id', 'id');
    }

    // One product variant are related to its stock
    public function stock(): HasOne
    {
        return $this->hasOne(Stock::class, 'product_id_variant');
    }
}
