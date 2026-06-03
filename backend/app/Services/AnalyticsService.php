<?php

namespace App\Services;

use App\Models\PaymentMethod;
use App\Models\PaymentMethodEvent;
use App\Models\Visit;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Str;

class AnalyticsService
{
    public function __construct(
        private readonly UserAgentParserService $userAgent,
        private readonly GeoLocationService $geo,
    ) {}

    /**
     * Anonymize an IP into a salted, non-reversible hash.
     */
    public function hashIp(?string $ip): ?string
    {
        if (! $ip) {
            return null;
        }

        return hash('sha256', config('analytics.ip_salt').'|'.$ip);
    }

    /**
     * Record a public visit. The raw IP is never persisted.
     *
     * @param  array{session_id?: string|null, referrer?: string|null}  $payload
     */
    public function recordVisit(Request $request, array $payload): Visit
    {
        $ua = $request->userAgent();
        $parsed = $this->userAgent->parse($ua);
        $location = $this->geo->locate($request->ip());

        return Visit::create([
            'session_id' => $payload['session_id'] ?? (string) Str::uuid(),
            'ip_hash' => $this->hashIp($request->ip()),
            'user_agent' => $ua ? Str::limit($ua, 250, '') : null,
            'device_type' => $parsed['device_type'],
            'browser' => $parsed['browser'],
            'platform' => $parsed['platform'],
            'country' => $location['country'],
            'region' => $location['region'],
            'city' => $location['city'],
            'referrer' => $payload['referrer'] ?? null,
            'visited_at' => now(),
        ]);
    }

    /**
     * Record a payment method interaction (view / copy_field / copy_all).
     *
     * @param  array{payment_method_id: int, event_type: string, session_id?: string|null, field_label?: string|null}  $payload
     */
    public function recordEvent(Request $request, array $payload): PaymentMethodEvent
    {
        $ua = $request->userAgent();

        return PaymentMethodEvent::create([
            'payment_method_id' => $payload['payment_method_id'],
            'session_id' => $payload['session_id'] ?? null,
            'event_type' => $payload['event_type'],
            'field_label' => $payload['field_label'] ?? null,
            'ip_hash' => $this->hashIp($request->ip()),
            'user_agent' => $ua ? Str::limit($ua, 250, '') : null,
        ]);
    }

    /* ------------------------------------------------------------------ */
    /* Aggregations for the admin dashboard                               */
    /* ------------------------------------------------------------------ */

    /**
     * @return array<string, mixed>
     */
    public function overview(): array
    {
        $totalMethods = PaymentMethod::count();
        $activeMethods = PaymentMethod::active()->count();
        $totalVisits = Visit::count();
        $uniqueVisitors = Visit::distinct('ip_hash')->count('ip_hash');
        $totalCopies = PaymentMethodEvent::whereIn('event_type', [
            PaymentMethodEvent::TYPE_COPY_FIELD,
            PaymentMethodEvent::TYPE_COPY_ALL,
        ])->count();

        $mostViewed = $this->topMethod(PaymentMethodEvent::TYPE_VIEW);
        $mostCopied = $this->topMethod([
            PaymentMethodEvent::TYPE_COPY_FIELD,
            PaymentMethodEvent::TYPE_COPY_ALL,
        ]);

        return [
            'total_methods' => $totalMethods,
            'active_methods' => $activeMethods,
            'total_visits' => $totalVisits,
            'unique_visitors' => $uniqueVisitors,
            'total_copies' => $totalCopies,
            'most_viewed_method' => $mostViewed,
            'most_copied_method' => $mostCopied,
            'recent_visits' => $this->recentVisits(),
            'visits_per_day' => $this->visitsPerDay(),
        ];
    }

    /**
     * @param  string|array<string>  $eventType
     * @return array{id: int, name: string, count: int}|null
     */
    private function topMethod(string|array $eventType): ?array
    {
        $types = (array) $eventType;

        $row = PaymentMethodEvent::query()
            ->selectRaw('payment_method_id, COUNT(*) as total')
            ->whereIn('event_type', $types)
            ->groupBy('payment_method_id')
            ->orderByDesc('total')
            ->first();

        if (! $row) {
            return null;
        }

        $method = PaymentMethod::find($row->payment_method_id);

        if (! $method) {
            return null;
        }

        return [
            'id' => $method->id,
            'name' => $method->name,
            'count' => (int) $row->total,
        ];
    }

    /**
     * @return array<int, array{date: string, total: int}>
     */
    public function visitsPerDay(int $days = 14): array
    {
        $since = Carbon::today()->subDays($days - 1);

        $rows = Visit::query()
            ->selectRaw('DATE(visited_at) as day, COUNT(*) as total')
            ->where('visited_at', '>=', $since)
            ->groupBy('day')
            ->pluck('total', 'day');

        $series = [];
        for ($i = 0; $i < $days; $i++) {
            $date = $since->copy()->addDays($i)->toDateString();
            $series[] = [
                'date' => $date,
                'total' => (int) ($rows[$date] ?? 0),
            ];
        }

        return $series;
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    public function recentVisits(int $limit = 10): array
    {
        return Visit::query()
            ->latest('visited_at')
            ->limit($limit)
            ->get(['id', 'device_type', 'browser', 'platform', 'country', 'city', 'referrer', 'visited_at'])
            ->toArray();
    }

    /**
     * Per-method view & copy counts (for the methods table + charts).
     *
     * @return array<int, array{id: int, name: string, views: int, copies: int}>
     */
    public function methodStats(): array
    {
        $views = PaymentMethodEvent::query()
            ->selectRaw('payment_method_id, COUNT(*) as total')
            ->where('event_type', PaymentMethodEvent::TYPE_VIEW)
            ->groupBy('payment_method_id')
            ->pluck('total', 'payment_method_id');

        $copies = PaymentMethodEvent::query()
            ->selectRaw('payment_method_id, COUNT(*) as total')
            ->whereIn('event_type', [
                PaymentMethodEvent::TYPE_COPY_FIELD,
                PaymentMethodEvent::TYPE_COPY_ALL,
            ])
            ->groupBy('payment_method_id')
            ->pluck('total', 'payment_method_id');

        return PaymentMethod::ordered()->get(['id', 'name'])
            ->map(fn (PaymentMethod $m) => [
                'id' => $m->id,
                'name' => $m->name,
                'views' => (int) ($views[$m->id] ?? 0),
                'copies' => (int) ($copies[$m->id] ?? 0),
            ])
            ->toArray();
    }

    /**
     * @return array<int, array{label: string, total: int}>
     */
    public function deviceBreakdown(): array
    {
        return $this->breakdown(Visit::query(), 'device_type');
    }

    /**
     * @return array<int, array{label: string, total: int}>
     */
    public function browserBreakdown(): array
    {
        return $this->breakdown(Visit::query(), 'browser');
    }

    /**
     * @return array{countries: array, regions: array, cities: array}
     */
    public function locationBreakdown(): array
    {
        return [
            'countries' => $this->breakdown(Visit::query()->whereNotNull('country'), 'country'),
            'regions' => $this->breakdown(Visit::query()->whereNotNull('region'), 'region'),
            'cities' => $this->breakdown(Visit::query()->whereNotNull('city'), 'city'),
        ];
    }

    /**
     * @return array<int, array{label: string, total: int}>
     */
    public function referrerBreakdown(): array
    {
        return $this->breakdown(Visit::query()->whereNotNull('referrer'), 'referrer');
    }

    /**
     * Generic "group by column, count" helper.
     *
     * @param  \Illuminate\Database\Eloquent\Builder<Visit>  $query
     * @return array<int, array{label: string, total: int}>
     */
    private function breakdown($query, string $column): array
    {
        return $query
            ->selectRaw("COALESCE($column, 'Inconnu') as label, COUNT(*) as total")
            ->groupBy('label')
            ->orderByDesc('total')
            ->limit(20)
            ->get()
            ->map(fn ($row) => [
                'label' => (string) $row->label,
                'total' => (int) $row->total,
            ])
            ->toArray();
    }
}
