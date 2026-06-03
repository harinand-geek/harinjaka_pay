<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\Storage;

class PaymentMethod extends Model
{
    use HasFactory;

    protected static function booted(): void
    {
        // Remove the uploaded logo file when the method is deleted.
        static::deleting(function (PaymentMethod $method) {
            if ($method->logo_path) {
                Storage::disk('public')->delete($method->logo_path);
            }
        });
    }

    protected $fillable = [
        'name',
        'slug',
        'type',
        'description',
        'badge',
        'icon',
        'logo_path',
        'color',
        'is_active',
        'sort_order',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
            'sort_order' => 'integer',
        ];
    }

    /**
     * @return HasMany<PaymentField, $this>
     */
    public function fields(): HasMany
    {
        return $this->hasMany(PaymentField::class)->orderBy('sort_order');
    }

    /**
     * @return HasMany<PaymentMethodEvent, $this>
     */
    public function events(): HasMany
    {
        return $this->hasMany(PaymentMethodEvent::class);
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeOrdered($query)
    {
        return $query->orderBy('sort_order')->orderBy('id');
    }
}
