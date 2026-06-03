<?php

namespace App\Http\Requests;

use App\Models\PaymentMethodEvent;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StorePaymentEventRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'payment_method_id' => ['required', 'integer', 'exists:payment_methods,id'],
            'event_type' => ['required', Rule::in(PaymentMethodEvent::TYPES)],
            'session_id' => ['nullable', 'string', 'max:100'],
            'field_label' => ['nullable', 'string', 'max:120'],
        ];
    }
}
