<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['payment_method_name', 'code', 'is_active'])]
class PaymentMethods extends Model
{
    use HasFactory;

    // RELATIONSHIP BETWEEN ORDERS TABLE
    public function orders(): HasMany
    {
        return $this->hasMany(Order::class, 'payment_method_id');
    }
}
