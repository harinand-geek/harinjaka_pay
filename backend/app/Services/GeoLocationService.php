<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * Resolves an IP address to a coarse location (country/region/city).
 *
 * Disabled by default (GEO_LOOKUP_ENABLED=false) so the app never makes a
 * network call unless explicitly opted in. When enabled it uses the free
 * ip-api.com endpoint. Any failure is swallowed and returns null values so
 * analytics ingestion is never blocked by geolocation.
 */
class GeoLocationService
{
    /**
     * @return array{country: ?string, region: ?string, city: ?string}
     */
    public function locate(?string $ip): array
    {
        $empty = ['country' => null, 'region' => null, 'city' => null];

        if (! config('analytics.geo_lookup_enabled')) {
            return $empty;
        }

        if (! $ip || $this->isPrivateIp($ip)) {
            return $empty;
        }

        try {
            $response = Http::timeout(2)->get("http://ip-api.com/json/{$ip}", [
                'fields' => 'status,country,regionName,city',
            ]);

            if ($response->ok() && $response->json('status') === 'success') {
                return [
                    'country' => $response->json('country'),
                    'region' => $response->json('regionName'),
                    'city' => $response->json('city'),
                ];
            }
        } catch (\Throwable $e) {
            Log::warning('GeoLocation lookup failed', ['message' => $e->getMessage()]);
        }

        return $empty;
    }

    private function isPrivateIp(string $ip): bool
    {
        return ! filter_var(
            $ip,
            FILTER_VALIDATE_IP,
            FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE
        );
    }
}
