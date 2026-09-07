<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['name', 'base_price', 'tax_applied_id', 'image_url'])]
class Product extends Model
{
    use HasFactory, HasUuids;

    protected $keyType = 'string'; // tell the model that we're using UUIDs (Universal Unique IDentifier)

    public $incrementing = false;

    /*
    RELATIONSHIPS BETWEEN TAX TABLE AND PRODUCT TABLE */

    // Verify type of tax applied into a product by and FK on taxes table
    public function tax(): BelongsTo
    {
        return $this->belongsTo(Tax::class, 'tax_applied_id');
    }

    // RELATIONSHIP BETWEEN PRODUCT AND ITS VARIANTS

    public function variants(): HasMany
    {
        return $this->hasMany(ProductVariants::class, 'fk_product_id');
    }
}
