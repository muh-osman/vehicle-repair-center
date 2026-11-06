<?php

namespace App\Http\Controllers;

use App\Models\ServiceDiscount;
use Illuminate\Http\Request;

class ServiceDiscountController extends Controller
{
    public function index()
    {
        return response()->json(ServiceDiscount::all());
    }

    public function show(string $id)
    {
        $discount = ServiceDiscount::find($id);

        if (!$discount) {
            return response()->json(['message' => 'Not found'], 404);
        }

        return response()->json($discount);
    }

    public function store(Request $request)
    {
        $request->validate([
            'service_id'      => 'required|integer|unique:service_discounts,service_id',
            'service_name_ar' => 'required|string',
            'discount_value'  => 'required|integer|min:0',
            'discount_unit'   => 'required|in:%,ريال',
            'is_active'       => 'boolean',
        ]);

        $discount = ServiceDiscount::create($request->all());

        return response()->json($discount, 201);
    }

    public function update(Request $request, string $id)
    {
        $discount = ServiceDiscount::find($id);

        if (!$discount) {
            return response()->json(['message' => 'Not found'], 404);
        }

        $request->validate([
            'service_id'      => 'sometimes|integer|unique:service_discounts,service_id,' . $id,
            'service_name_ar' => 'sometimes|string',
            'discount_value'  => 'sometimes|integer|min:0',
            'discount_unit'   => 'sometimes|in:%,ريال',
            'is_active'       => 'sometimes|boolean',
            'expires_at'      => 'nullable|date|after:now',
        ]);

        $discount->update($request->all());

        return response()->json($discount);
    }

    public function destroy(string $id)
    {
        $discount = ServiceDiscount::find($id);

        if (!$discount) {
            return response()->json(['message' => 'Not found'], 404);
        }

        $discount->delete();

        return response()->json(['message' => 'Deleted successfully']);
    }
}
