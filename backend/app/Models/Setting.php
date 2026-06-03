<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Setting extends Model
{
    protected $fillable = ['key', 'value'];

    /** Keys that are safe to expose on the public API. */
    public const PUBLIC_KEYS = [
        'background_image_url',
        'background_overlay',
        // Footer — contact
        'footer_phone',
        'footer_whatsapp',
        'footer_email',
        // Footer — links
        'footer_facebook',
        'footer_twitter',
        'footer_linkedin',
        'footer_shop',
        'footer_blog',
        'footer_qrcode',
        // Footer — info
        'footer_address',
        'footer_hours',
    ];

    public static function get(string $key, ?string $default = null): ?string
    {
        return static::query()->where('key', $key)->value('value') ?? $default;
    }

    public static function set(string $key, ?string $value): void
    {
        static::updateOrCreate(['key' => $key], ['value' => $value]);
    }

    /**
     * Return the given keys as a flat key => value map.
     *
     * @param  array<int, string>  $keys
     * @return array<string, string|null>
     */
    public static function map(array $keys): array
    {
        $stored = static::query()->whereIn('key', $keys)->pluck('value', 'key')->all();

        $result = [];
        foreach ($keys as $key) {
            $result[$key] = $stored[$key] ?? null;
        }

        return $result;
    }
}
