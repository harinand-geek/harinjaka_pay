<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateSettingsRequest extends FormRequest
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
            'background_image_url' => ['nullable', 'string', 'url', 'max:2048'],
            'background_overlay' => ['nullable', 'numeric', 'between:0,1'],

            // Footer — contact
            'footer_phone' => ['nullable', 'string', 'max:40'],
            'footer_whatsapp' => ['nullable', 'string', 'max:40'],
            'footer_email' => ['nullable', 'string', 'email', 'max:191'],

            // Footer — links
            'footer_facebook' => ['nullable', 'string', 'url', 'max:2048'],
            'footer_twitter' => ['nullable', 'string', 'url', 'max:2048'],
            'footer_linkedin' => ['nullable', 'string', 'url', 'max:2048'],
            'footer_shop' => ['nullable', 'string', 'url', 'max:2048'],
            'footer_blog' => ['nullable', 'string', 'url', 'max:2048'],
            'footer_qrcode' => ['nullable', 'string', 'url', 'max:2048'],

            // Footer — info
            'footer_address' => ['nullable', 'string', 'max:255'],
            'footer_hours' => ['nullable', 'string', 'max:120'],
        ];
    }

    public function messages(): array
    {
        return [
            'background_image_url.url' => "L'image de fond doit être une URL valide.",
            'background_overlay.between' => "L'opacité doit être comprise entre 0 et 1.",
            'footer_email.email' => "L'adresse e-mail du pied de page n'est pas valide.",
            'footer_facebook.url' => 'Le lien Facebook doit être une URL valide.',
            'footer_twitter.url' => 'Le lien Twitter / X doit être une URL valide.',
            'footer_linkedin.url' => 'Le lien LinkedIn doit être une URL valide.',
            'footer_shop.url' => 'Le lien Shop doit être une URL valide.',
            'footer_blog.url' => 'Le lien Blog doit être une URL valide.',
            'footer_qrcode.url' => 'Le lien QrCode doit être une URL valide.',
        ];
    }
}
