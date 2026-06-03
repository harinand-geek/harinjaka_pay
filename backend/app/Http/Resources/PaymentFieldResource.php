<?php

namespace App\Http\Resources;

use App\Models\PaymentField;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin PaymentField */
class PaymentFieldResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'label' => $this->label,
            'value' => $this->value,
            // Fall back to the displayed value when no dedicated copy value is set.
            'copy_value' => $this->copy_value ?? $this->value,
            'sort_order' => $this->sort_order,
        ];
    }
}
