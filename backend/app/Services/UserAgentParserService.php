<?php

namespace App\Services;

/**
 * Lightweight, dependency-free User-Agent parser.
 *
 * Returns a normalized device type, browser and platform without any
 * external package. Good enough for privacy-friendly analytics; we never
 * store anything more granular than these buckets.
 */
class UserAgentParserService
{
    /**
     * @return array{device_type: string, browser: string, platform: string}
     */
    public function parse(?string $userAgent): array
    {
        $ua = $userAgent ?? '';

        return [
            'device_type' => $this->deviceType($ua),
            'browser' => $this->browser($ua),
            'platform' => $this->platform($ua),
        ];
    }

    private function deviceType(string $ua): string
    {
        if ($ua === '') {
            return 'unknown';
        }

        // Tablets first (some tablet UAs also contain "Mobile").
        if (preg_match('/iPad|Tablet|PlayBook|Silk|(Android(?!.*Mobile))/i', $ua)) {
            return 'tablet';
        }

        if (preg_match('/Mobile|iPhone|iPod|Android.*Mobile|Windows Phone|webOS|BlackBerry|Opera Mini|IEMobile/i', $ua)) {
            return 'mobile';
        }

        return 'desktop';
    }

    private function browser(string $ua): string
    {
        $patterns = [
            'Edge' => '/Edg(e|A|iOS)?\//i',
            'Opera' => '/OPR\/|Opera/i',
            'Samsung Internet' => '/SamsungBrowser/i',
            'Chrome' => '/Chrome|CriOS/i',
            'Firefox' => '/Firefox|FxiOS/i',
            'Safari' => '/Safari/i',
            'Internet Explorer' => '/MSIE|Trident/i',
        ];

        foreach ($patterns as $name => $pattern) {
            if (preg_match($pattern, $ua)) {
                return $name;
            }
        }

        return 'Autre';
    }

    private function platform(string $ua): string
    {
        $patterns = [
            'Windows' => '/Windows NT|Windows Phone/i',
            'iOS' => '/iPhone|iPad|iPod/i',
            'macOS' => '/Macintosh|Mac OS X/i',
            'Android' => '/Android/i',
            'Linux' => '/Linux/i',
            'Chrome OS' => '/CrOS/i',
        ];

        foreach ($patterns as $name => $pattern) {
            if (preg_match($pattern, $ua)) {
                return $name;
            }
        }

        return 'Autre';
    }
}
