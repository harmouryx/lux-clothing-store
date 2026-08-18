<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use App\Models\Product;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['name', 'tax_percentage', 'is_active']) ]
class Tax extends Model
{

    use HasFactory;

    //Verify Products that has a tax applied into Product.php model, checking the products table
    public function products(): HasMany
    {
        return $this->hasMany(Product::class, 'tax_applied_id');
    }

}
