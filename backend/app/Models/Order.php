<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Casts\AsArrayObject;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['user_id', 'payment_method_id', 'payment_reference', 'total_amount', 'status', 'shipping_info'])]

class Order extends Model
{
    use HasFactory;

    protected function casts(): array
    {
        return [
            'shipping_info' => AsArrayObject::class,
        ];
    }

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
