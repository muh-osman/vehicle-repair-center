<?php

namespace App\Http\Controllers;

use App\Models\Price;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class PriceController extends Controller
{
    public function index()
    {
        $prices = Price::with(['carModel:id,model_name', 'yearOfManufacture:id,year', 'service:id,service_name'])
            ->select('id', 'price', 'car_model_id', 'year_id', 'service_id')
            ->get()
            ->map(function ($price) {
                return [
                    'id' => $price->id,
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
        $price = Price::with(['carModel', 'yearOfManufacture', 'service'])->find($id);

        if (!$price) {
            return response()->json(['message' => 'Price not found'], 404);
        }

        $formattedPrice = [
            'id' => $price->id,
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

    // public function getPrice(Request $request)
    // {
    //     // Retrieve the selected car details and service type from the request
    //     $country = $request->input('country');
    //     $manufacturer = $request->input('manufacturer');
    //     $model = $request->input('model');
    //     $year = $request->input('year');
    //     $serviceType = $request->input('service_type');

    //     // Query the database to fetch the price based on the selected criteria
    //     $carYear = CarYear::where('year_of_manufacture', $year)
    //         ->whereHas('model.manufacturer', function ($query) use ($manufacturer, $country) {
    //             $query->where('manufacturer_name', $manufacturer)
    //                 ->whereHas('country', function ($query) use ($country) {
    //                     $query->where('country_name', $country);
    //                 });
    //         })->first();

    //     if ($carYear) {
    //         $service = Service::where('service_type', $serviceType)->first();

    //         if ($service) {
    //             // Calculate the price based on the selected car details and service type
    //             $price = $service->price;

    //             return response()->json(['price' => $price]);
    //         }
    //     }

    //     return response()->json(['error' => 'Price not found'], 404);
    // }
}
