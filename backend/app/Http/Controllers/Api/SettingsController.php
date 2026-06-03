<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\JsonResponse;

class SettingsController extends Controller
{
    /**
     * GET /api/settings
     * Public, read-only subset of settings used by the front-end (theme, etc.).
     */
    public function index(): JsonResponse
    {
        return response()->json(Setting::map(Setting::PUBLIC_KEYS));
    }
}
