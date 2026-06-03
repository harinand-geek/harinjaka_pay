<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UploadLogoRequest extends FormRequest
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
            'logo' => [
                'required',
                'file',
                'image',
                'mimes:png,jpg,jpeg,webp',
                'max:1024', // 1 MB
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'logo.max' => 'Le logo ne doit pas dépasser 1 Mo.',
            'logo.image' => 'Le fichier doit être une image.',
            'logo.mimes' => 'Formats acceptés : PNG, JPG, WEBP.',
        ];
    }
}
