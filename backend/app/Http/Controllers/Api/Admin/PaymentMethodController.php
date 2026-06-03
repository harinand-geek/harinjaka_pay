<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StorePaymentMethodRequest;
use App\Http\Requests\UpdatePaymentMethodRequest;
use App\Http\Requests\UploadLogoRequest;
use App\Http\Resources\PaymentMethodResource;
use App\Models\PaymentMethod;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class PaymentMethodController extends Controller
{
    /**
     * GET /api/admin/payment-methods
     * All methods (active + inactive) with fields and view/copy counts.
     */
    public function index(): JsonResponse
    {
        $methods = PaymentMethod::ordered()
            ->with('fields')
            ->withCount([
                'events as views_count' => fn ($q) => $q->where('event_type', 'view_method'),
                'events as copies_count' => fn ($q) => $q->whereIn('event_type', ['copy_field', 'copy_all']),
            ])
            ->get();

        return response()->json([
            'data' => $methods->map(fn (PaymentMethod $m) => array_merge(
                (new PaymentMethodResource($m))->toArray(request()),
                [
                    'views_count' => (int) $m->views_count,
                    'copies_count' => (int) $m->copies_count,
                ]
            )),
        ]);
    }

    /**
     * POST /api/admin/payment-methods
     */
    public function store(StorePaymentMethodRequest $request): JsonResponse
    {
        $data = $request->validated();

        $method = DB::transaction(function () use ($data) {
            $method = PaymentMethod::create($data);
            $this->syncFields($method, $data['fields'] ?? []);

            return $method;
        });

        return (new PaymentMethodResource($method->load('fields')))
            ->response()
            ->setStatusCode(201);
    }

    /**
     * GET /api/admin/payment-methods/{paymentMethod}
     */
    public function show(PaymentMethod $paymentMethod): PaymentMethodResource
    {
        return new PaymentMethodResource($paymentMethod->load('fields'));
    }

    /**
     * PUT /api/admin/payment-methods/{paymentMethod}
     */
    public function update(UpdatePaymentMethodRequest $request, PaymentMethod $paymentMethod): PaymentMethodResource
    {
        $data = $request->validated();

        DB::transaction(function () use ($paymentMethod, $data) {
            $paymentMethod->update($data);
            $this->syncFields($paymentMethod, $data['fields'] ?? []);
        });

        return new PaymentMethodResource($paymentMethod->load('fields'));
    }

    /**
     * DELETE /api/admin/payment-methods/{paymentMethod}
     */
    public function destroy(PaymentMethod $paymentMethod): JsonResponse
    {
        $paymentMethod->delete(); // cascades to fields + events

        return response()->json(['message' => 'Méthode supprimée.']);
    }

    /**
     * PATCH /api/admin/payment-methods/{paymentMethod}/toggle
     */
    public function toggle(PaymentMethod $paymentMethod): PaymentMethodResource
    {
        $paymentMethod->update(['is_active' => ! $paymentMethod->is_active]);

        return new PaymentMethodResource($paymentMethod->load('fields'));
    }

    /**
     * POST /api/admin/payment-methods/{paymentMethod}/logo
     * Uploads (or replaces) the wallet logo. Old file is removed.
     */
    public function uploadLogo(UploadLogoRequest $request, PaymentMethod $paymentMethod): PaymentMethodResource
    {
        // Remove the previous logo if any.
        if ($paymentMethod->logo_path) {
            Storage::disk('public')->delete($paymentMethod->logo_path);
        }

        $path = $request->file('logo')->store('payment-logos', 'public');
        $paymentMethod->update(['logo_path' => $path]);

        return new PaymentMethodResource($paymentMethod->load('fields'));
    }

    /**
     * DELETE /api/admin/payment-methods/{paymentMethod}/logo
     * Removes the uploaded logo and falls back to the built-in icon.
     */
    public function deleteLogo(PaymentMethod $paymentMethod): PaymentMethodResource
    {
        if ($paymentMethod->logo_path) {
            Storage::disk('public')->delete($paymentMethod->logo_path);
            $paymentMethod->update(['logo_path' => null]);
        }

        return new PaymentMethodResource($paymentMethod->load('fields'));
    }

    /**
     * PATCH /api/admin/payment-methods/reorder
     * Body: { "order": [methodId1, methodId2, ...] }
     */
    public function reorder(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'order' => ['required', 'array'],
            'order.*' => ['integer', 'exists:payment_methods,id'],
        ]);

        DB::transaction(function () use ($validated) {
            foreach ($validated['order'] as $position => $id) {
                PaymentMethod::where('id', $id)->update(['sort_order' => $position]);
            }
        });

        return response()->json(['message' => 'Ordre mis à jour.']);
    }

    /**
     * Reconcile the dynamic copyable fields of a method.
     * Existing fields (by id) are updated, new ones created, missing ones deleted.
     *
     * @param  array<int, array<string, mixed>>  $fields
     */
    private function syncFields(PaymentMethod $method, array $fields): void
    {
        $keptIds = [];

        foreach (array_values($fields) as $index => $field) {
            $payload = [
                'label' => $field['label'],
                'value' => $field['value'],
                'copy_value' => $field['copy_value'] ?? null,
                'sort_order' => $field['sort_order'] ?? $index,
            ];

            if (! empty($field['id'])) {
                $existing = $method->fields()->whereKey($field['id'])->first();
                if ($existing) {
                    $existing->update($payload);
                    $keptIds[] = $existing->id;

                    continue;
                }
            }

            $created = $method->fields()->create($payload);
            $keptIds[] = $created->id;
        }

        $method->fields()->whereKeyNot($keptIds)->delete();
    }
}
