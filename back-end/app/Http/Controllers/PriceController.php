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
        // $validator = Validator::make($request->all(), [
        //     'car_model_id' => 'required|exists:car_models,id',
        //     'year_id' => 'required|exists:year_of_manufactures,id',
        //     'service_id' => 'required|exists:services,id',
        //     'price' => 'required|numeric',
        // ]);

        // if ($validator->fails()) {
        //     return response()->json(['errors' => $validator->errors()], 400);
        // }

        // $existingPrice = Price::where('car_model_id', $request->car_model_id)
        //     ->where('year_id', $request->year_id)
        //     ->where('service_id', $request->service_id)
        //     ->first();

        // if ($existingPrice) {
        //     return response()->json(['message' => 'Price for this combination already exists'], 400);
        // }

        // $price = Price::create($request->all());
        // return response()->json($price, 201);


        $validator = Validator::make($request->all(), [
            'car_model_id' => 'required|exists:car_models,id',
            'years' => 'required|array',
            'years.*.year_id' => 'required|exists:year_of_manufactures,id',
            'years.*.services' => 'required|array',
            'years.*.services.*.service_id' => 'required|exists:services,id',
            'years.*.services.*.price' => 'required|numeric',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 400);
        }

        $prices = [];

        foreach ($request->years as $year) {
            foreach ($year['services'] as $service) {
                $existingPrice = Price::where('car_model_id', $request->car_model_id)
                    ->where('year_id', $year['year_id'])
                    ->where('service_id', $service['service_id'])
                    ->first();

                if ($existingPrice) {
                    return response()->json(['message' => 'Price for this combination already exists'], 400);
                }

                $price = new Price();
                $price->car_model_id = $request->car_model_id;
                $price->year_id = $year['year_id'];
                $price->service_id = $service['service_id'];
                $price->price = $service['price'];
                $price->save();

                $prices[] = $price;
            }
        }

        return response()->json($prices, 201);
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
        try {
            $carModelId = $request->input('model');
            $yearId = $request->input('year');
            $serviceIds = explode(',', $request->input('service'));

            $prices = Price::where('car_model_id', $carModelId)
                ->where('year_id', $yearId)
                ->whereIn('service_id', $serviceIds)
                ->get();

            if ($prices->isNotEmpty()) {
                $totalPrice = $prices->sum('price');
                return $totalPrice;
            }

            return response()->json(['error' => 'Price not found for the specified car model, year, and service.'], 404);
        } catch (\Exception $e) {
            return response()->json(['error' => 'An error occurred while fetching the price.'], 500);
        }
    }
}
