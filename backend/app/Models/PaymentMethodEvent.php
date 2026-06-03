<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PaymentMethodEvent extends Model
{
    public const TYPE_VIEW = 'view_method';
    public const TYPE_COPY_FIELD = 'copy_field';
    public const TYPE_COPY_ALL = 'copy_all';

    public const TYPES = [
        self::TYPE_VIEW,
        self::TYPE_COPY_FIELD,
        self::TYPE_COPY_ALL,
    ];

    protected $fillable = [
        'payment_method_id',
        'session_id',
        'event_type',
        'field_label',
        'ip_hash',
        'user_agent',
    ];

    /**
     * @return BelongsTo<PaymentMethod, $this>
     */
    public function paymentMethod(): BelongsTo
    {
        return $this->belongsTo(PaymentMethod::class);
    }
}
