<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\UpdateSettingsRequest;
use App\Models\Setting;
use Illuminate\Http\JsonResponse;

class SettingsController extends Controller
{
    /** GET /api/admin/settings */
    public function index(): JsonResponse
    {
        return response()->json(Setting::map(Setting::PUBLIC_KEYS));
    }

    /** PUT /api/admin/settings */
    public function update(UpdateSettingsRequest $request): JsonResponse
    {
        foreach ($request->validated() as $key => $value) {
            // Only persist whitelisted/public keys.
            if (in_array($key, Setting::PUBLIC_KEYS, true)) {
                Setting::set($key, $value === null ? null : (string) $value);
            }
        }

        return response()->json(Setting::map(Setting::PUBLIC_KEYS));
    }
}
