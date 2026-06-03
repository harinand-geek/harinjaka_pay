<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Services\AnalyticsService;
use Illuminate\Http\JsonResponse;

class AdminAnalyticsController extends Controller
{
    public function __construct(private readonly AnalyticsService $analytics) {}

    /** GET /api/admin/analytics/overview */
    public function overview(): JsonResponse
    {
        return response()->json($this->analytics->overview());
    }

    /** GET /api/admin/analytics/visits */
    public function visits(): JsonResponse
    {
        return response()->json([
            'visits_per_day' => $this->analytics->visitsPerDay(30),
            'recent_visits' => $this->analytics->recentVisits(20),
        ]);
    }

    /** GET /api/admin/analytics/payment-methods */
    public function paymentMethods(): JsonResponse
    {
        return response()->json([
            'methods' => $this->analytics->methodStats(),
        ]);
    }

    /** GET /api/admin/analytics/locations */
    public function locations(): JsonResponse
    {
        return response()->json($this->analytics->locationBreakdown());
    }

    /** GET /api/admin/analytics/devices */
    public function devices(): JsonResponse
    {
        return response()->json([
            'devices' => $this->analytics->deviceBreakdown(),
            'browsers' => $this->analytics->browserBreakdown(),
        ]);
    }

    /** GET /api/admin/analytics/referrers */
    public function referrers(): JsonResponse
    {
        return response()->json([
            'referrers' => $this->analytics->referrerBreakdown(),
        ]);
    }
}
