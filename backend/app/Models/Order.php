<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Order extends Model
{
    use HasFactory;

    // RELATIONSHIP BETWEEN PAYMENT METHODS TABLE

    public function payment(): BelongsTo
    {
        return $this->belongsTo(PaymentMethods::class, 'payment_method_id');
    }

    // RELATIONSHIP BETWEEN ORDER DETAILS

    public function details(): HasMany
    {
        return $this->hasMany(OrderDetails::class, 'order_id');
    }

    // RELATIONSHIP BETWEEN USER TABLE

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
