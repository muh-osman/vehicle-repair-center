<?php

namespace App\Http\Controllers;

use App\Models\Price;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class PriceController extends Controller
{
    public function index()
    {
        $prices = Price::with(['carModel.manufacturer.country', 'yearOfManufacture', 'service'])
            ->select('prices.id', 'price', 'car_model_id', 'year_id', 'service_id')
            ->join('car_models', 'prices.car_model_id', '=', 'car_models.id')
            ->join('manufacturers', 'car_models.manufacturer_id', '=', 'manufacturers.id')
            ->orderBy('manufacturers.manufacture_name')
            ->get()
            ->map(function ($price) {
                return [
                    'id' => $price->id,
                    'country' => $price->carModel->manufacturer->country->country_name,
                    'manufacturer' => $price->carModel->manufacturer->manufacture_name,
                    'model_name' => $price->carModel->model_name,
                    'year' => $price->yearOfManufacture->year,
                    'service_name' => $price->service->service_name,
                    'price' => $price->price,
                ];
            });

        return response()->json($prices);
    }

    public function show($id)
    {
        $price = Price::with(['carModel.manufacturer.country', 'yearOfManufacture', 'service'])->find($id);

        if (!$price) {
            return response()->json(['message' => 'Price not found'], 404);
        }

        $formattedPrice = [
            'id' => $price->id,
            'country' => $price->carModel->manufacturer->country->country_name,
            'manufacturer' => $price->carModel->manufacturer->manufacture_name,
            'model_name' => $price->carModel->model_name,
            'year' => $price->yearOfManufacture->year,
            'service_name' => $price->service->service_name,
            'price' => $price->price,
        ];

        return response()->json($formattedPrice);
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

    public function getPrice(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'country' => 'required',
            'manufacturer' => 'required',
            'model' => 'required',
            'year' => 'required',
            'service' => 'required',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 400);
        }

        $price = Price::with(['carModel.manufacturer.country', 'yearOfManufacture', 'service'])
            ->whereHas('carModel.manufacturer.country', function ($query) use ($request) {
                $query->where('country_name', $request->country);
            })
            ->whereHas('carModel.manufacturer', function ($query) use ($request) {
                $query->where('manufacture_name', $request->manufacturer);
            })
            ->whereHas('carModel', function ($query) use ($request) {
                $query->where('model_name', $request->model);
            })
            ->whereHas('yearOfManufacture', function ($query) use ($request) {
                $query->where('year', $request->year);
            })
            ->whereHas('service', function ($query) use ($request) {
                $query->where('service_name', $request->service);
            })
            ->select('id', 'price', 'car_model_id', 'year_id', 'service_id')
            ->first();

        if (!$price) {
            return response()->json(['message' => 'Price not found for the selected criteria'], 404);
        }

        $formattedPrice = [
            'id' => $price->id,
            'model_name' => $price->carModel->model_name,
            'manufacturer' => $price->carModel->manufacturer->manufacture_name,
            'country' => $price->carModel->manufacturer->country->country_name,
            'year' => $price->yearOfManufacture->year,
            'service_name' => $price->service->service_name,
            'price' => $price->price,
        ];

        return response()->json($formattedPrice);
    }
}
