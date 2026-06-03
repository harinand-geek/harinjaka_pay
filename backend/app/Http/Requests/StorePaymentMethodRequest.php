<?php

namespace App\Http\Requests;

use App\Models\PaymentMethod;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class StorePaymentMethodRequest extends FormRequest
{
    public function authorize(): bool
    {
        // Route is already protected by the admin middleware stack.
        return true;
    }

    protected function prepareForValidation(): void
    {
        if (! $this->filled('slug') && $this->filled('name')) {
            $this->merge(['slug' => Str::slug($this->input('name'))]);
        }
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:120'],
            'slug' => ['required', 'string', 'max:140', 'alpha_dash', Rule::unique('payment_methods', 'slug')],
            'type' => ['required', Rule::in(['mobile_money', 'bank_transfer', 'other'])],
            'description' => ['nullable', 'string', 'max:500'],
            'badge' => ['nullable', 'string', 'max:40'],
            'icon' => ['nullable', 'string', 'max:60'],
            'color' => ['nullable', 'string', 'max:40'],
            'is_active' => ['boolean'],
            'sort_order' => ['integer', 'min:0'],

            'fields' => ['array'],
            'fields.*.label' => ['required', 'string', 'max:120'],
            'fields.*.value' => ['required', 'string', 'max:255'],
            'fields.*.copy_value' => ['nullable', 'string', 'max:255'],
            'fields.*.sort_order' => ['integer', 'min:0'],
        ];
    }
}
