<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\PaymentMethodResource;
use App\Models\PaymentMethod;

class PublicPaymentMethodController extends Controller
{
    /**
     * GET /api/payment-methods
     * Active payment methods with their fields, ordered by sort_order.
     */
    public function index()
    {
        $methods = PaymentMethod::active()
            ->ordered()
            ->with('fields')
            ->get();

        return PaymentMethodResource::collection($methods);
    }
}
