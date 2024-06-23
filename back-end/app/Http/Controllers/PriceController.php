<?php

namespace App\Http\Controllers;

use App\Models\Price;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class PriceController extends Controller
{
    public function index()
    {
        $prices = Price::all();
        return response()->json($prices);
    }

    public function show($id)
    {
        $price = Price::find($id);
        if (!$price) {
            return response()->json(['message' => 'Price not found'], 404);
        }
        return response()->json($price);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'car_model_id' => 'required|exists:car_models,id',
            'year_id' => 'required|exists:year_of_manufactures,id',
            'service_id' => 'required|exists:services,id',
            'price' => 'required|numeric',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 400);
        }

        $existingPrice = Price::where('car_model_id', $request->car_model_id)
            ->where('year_id', $request->year_id)
            ->where('service_id', $request->service_id)
            ->first();

        if ($existingPrice) {
            return response()->json(['message' => 'Price for this combination already exists'], 400);
        }

        $price = Price::create($request->all());
        return response()->json($price, 201);
    }

    public function update(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'car_model_id' => 'exists:car_models,id',
            'year_id' => 'exists:year_of_manufactures,id',
            'service_id' => 'exists:services,id',
            'price' => 'numeric',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 400);
        }

        $price = Price::find($id);
        if (!$price) {
            return response()->json(['message' => 'Price not found'], 404);
        }

        $price->update($request->all());
        return response()->json($price);
    }

    public function destroy($id)
    {
        $price = Price::find($id);
        if (!$price) {
            return response()->json(['message' => 'Price not found'], 404);
        }
        $price->delete();
        return response()->json(['message' => 'Price deleted']);
    }
}
