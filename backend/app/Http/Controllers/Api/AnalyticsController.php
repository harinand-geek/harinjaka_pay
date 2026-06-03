<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreAnalyticsVisitRequest;
use App\Http\Requests\StorePaymentEventRequest;
use App\Services\AnalyticsService;
use Illuminate\Http\JsonResponse;

class AnalyticsController extends Controller
{
    public function __construct(private readonly AnalyticsService $analytics) {}

    /**
     * POST /api/analytics/visit
     */
    public function storeVisit(StoreAnalyticsVisitRequest $request): JsonResponse
    {
        $visit = $this->analytics->recordVisit($request, $request->validated());

        return response()->json([
            'session_id' => $visit->session_id,
        ], 201);
    }

    /**
     * POST /api/analytics/payment-event
     */
    public function storeEvent(StorePaymentEventRequest $request): JsonResponse
    {
        $this->analytics->recordEvent($request, $request->validated());

        return response()->json(['recorded' => true], 201);
    }
}
