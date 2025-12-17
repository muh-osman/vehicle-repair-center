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
            ->join('countries', 'manufacturers.country_id', '=', 'countries.id') // Join the countries table
            ->orderBy('countries.country_name')
            ->orderBy('manufacturers.manufacture_name')
            ->orderBy('car_models.model_name')
            ->orderByDesc('prices.year_id')
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
                    return response()->json(['message' => 'Prices for this model already exist'], 400);
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
        // $validator = Validator::make($request->all(), [
        //     'car_model_id' => 'exists:car_models,id',
        //     'years' => 'required|array',
        //     'years.*.year_id' => 'required|exists:year_of_manufactures,id',
        //     'years.*.services' => 'required|array',
        //     'years.*.services.*.service_id' => 'required|exists:services,id',
        //     'years.*.services.*.price' => 'required|numeric',
        // ]);

        // if ($validator->fails()) {
        //     return response()->json(['errors' => $validator->errors()], 400);
        // }


        // $price = Price::find($id);
        // if (!$price) {
        //     return response()->json(['message' => 'Price not found to edit, add price first.'], 404);
        // }


        // // Check if the car_model_id exists in the prices table
        // $existingPrice = Price::where('car_model_id', $request->car_model_id)->first();
        // if (!$existingPrice) {
        //     return response()->json(['message' => 'Can not edit prices of this model before add it, add the prices first.'], 400);
        // }



        // foreach ($request->years as $year) {
        //     foreach ($year['services'] as $service) {
        //         $existingPrice = Price::where('car_model_id', $request->car_model_id)
        //             ->where('year_id', $year['year_id'])
        //             ->where('service_id', $service['service_id'])
        //             ->where('id', '!=', $id) // Exclude the current price being updated
        //             ->first();

        //         if ($existingPrice) {
        //             // Update the existing price entry instead of creating a new one
        //             $existingPrice->price = $service['price'];
        //             $existingPrice->save();
        //         } else {
        //             // If no existing entry found, update the current price entry
        //             $price->car_model_id = $request->car_model_id;
        //             $price->year_id = $year['year_id'];
        //             $price->service_id = $service['service_id'];
        //             $price->price = $service['price'];
        //             $price->save();
        //         }
        //     }
        // }

        // return response()->json($price);


        $validator = Validator::make($request->all(), [
            'car_model_id' => 'exists:car_models,id',
            'years' => 'required|array',
            'years.*.year_id' => 'required|exists:year_of_manufactures,id',
            'years.*.services' => 'required|array',
            'years.*.services.*.service_id' => 'required|exists:services,id',
            'years.*.services.*.price' => 'required|numeric',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 400);
        }

        // Check if the car_model_id exists in the prices table
        $existingPrice = Price::where('car_model_id', $request->car_model_id)->first();

        if (!$existingPrice) {
            // If the car_model_id does not exist, add prices to the database
            foreach ($request->years as $year) {
                foreach ($year['services'] as $service) {
                    $price = new Price();
                    $price->car_model_id = $request->car_model_id;
                    $price->year_id = $year['year_id'];
                    $price->service_id = $service['service_id'];
                    $price->price = $service['price'];
                    $price->save();
                }
            }

            return response()->json(['message' => 'Prices added successfully'], 201);
        }

        // Update prices if the car_model_id already exists in the prices table
        foreach ($request->years as $year) {
            foreach ($year['services'] as $service) {
                $existingPrice = Price::where('car_model_id', $request->car_model_id)
                    ->where('year_id', $year['year_id'])
                    ->where('service_id', $service['service_id'])
                    ->where('id', '!=', $id) // Exclude the current price being updated
                    ->first();

                if ($existingPrice) {
                    // Update the existing price entry instead of creating a new one
                    $existingPrice->price = $service['price'];
                    $existingPrice->save();
                } else {
                    // If no existing entry found, create a new price entry
                    $price = new Price();
                    $price->car_model_id = $request->car_model_id;
                    $price->year_id = $year['year_id'];
                    $price->service_id = $service['service_id'];
                    $price->price = $service['price'];
                    $price->save();
                }
            }
        }

        return response()->json(['message' => 'Prices updated successfully']);
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


    public function getPricesByModelAndYear(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'car_model_id' => 'required|exists:car_models,id',
            'year_id' => 'required|exists:year_of_manufactures,id',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 400);
        }

        $carModelId = $request->query('car_model_id');
        $yearId = $request->query('year_id');

        $prices = Price::with(['service', 'carModel.manufacturer'])
            ->where('car_model_id', $carModelId)
            ->where('year_id', $yearId)
            ->get()
            ->groupBy('car_model_id')
            ->map(function ($groupedPrices) {
                $carModel = $groupedPrices->first()->carModel;
                $manufacturer = $carModel->manufacturer;

                return [
                    'model_name' => $carModel->model_name,
                    'manufacturer_name' => $manufacturer->manufacture_name,
                    'prices' => $groupedPrices->map(function ($price) {
                        return [
                            'service_name' => $price->service->service_name,
                            'price' => $price->price,
                        ];
                    }),
                ];
            });

        return response()->json($prices->values());
    }

    public function getDiscountedPricesByModelAndYear(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'car_model_id' => 'required|exists:car_models,id',
            'year_id' => 'required|exists:year_of_manufactures,id',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 400);
        }

        $carModelId = $request->query('car_model_id');
        $yearId = $request->query('year_id');

        $prices = Price::with(['service', 'carModel.manufacturer'])
            ->where('car_model_id', $carModelId)
            ->where('year_id', $yearId)
            ->get()
            ->groupBy('car_model_id')
            ->map(function ($groupedPrices) {
                $carModel = $groupedPrices->first()->carModel;
                $manufacturer = $carModel->manufacturer;

                return [
                    'model_name' => $carModel->model_name,
                    'manufacturer_name' => $manufacturer->manufacture_name,
                    'prices' => $groupedPrices->map(function ($price) {

                        $originalPrice = $price->price;
                        $serviceName = $price->service->service_name;

                        // Apply different discounts based on service type
                        if ($serviceName === "شامل") {
                            $discountedPrice = $originalPrice * 0.90; // 10% discount
                            $discountPercent = 10;
                            $discountUnit = "%";
                        } elseif ($serviceName === "أساسي") {
                            $discountedPrice = $originalPrice * 1; // 0% discount
                            $discountPercent = 0;
                            $discountUnit = "%";
                        } elseif ($serviceName === "محركات") {
                            $discountedPrice = $originalPrice * 1; // 0% discount
                            $discountPercent = 0;
                            $discountUnit = "%";
                        } else {
                            $discountedPrice = $originalPrice; // No discount
                            $discountPercent = 0;
                            $discountUnit = "%";
                        }


                        return [
                            'service_name' => $serviceName,
                            'price' => number_format($discountedPrice, 2, '.', ''), // Price after dicount (if exist)
                            'original_price' => number_format($originalPrice, 2, '.', ''), // Price before dicount (if exist)
                            'discount_percent' => $discountPercent,
                            'discount_unit' => $discountUnit,
                            'you_save' => number_format($originalPrice - $discountedPrice, 2, '.', ''),
                        ];
                    }),
                ];
            });

        return response()->json($prices->values());
    }

    // خدمة مرتاح
    public function getDiscountedPricesByModelAndYearForMertahService(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'car_model_id' => 'required|exists:car_models,id',
            'year_id' => 'required|exists:year_of_manufactures,id',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 400);
        }

        $carModelId = $request->query('car_model_id');
        $yearId = $request->query('year_id');

        $prices = Price::with(['service', 'carModel.manufacturer'])
            ->where('car_model_id', $carModelId)
            ->where('year_id', $yearId)
            ->get()
            ->groupBy('car_model_id')
            ->map(function ($groupedPrices) {
                $carModel = $groupedPrices->first()->carModel;
                $manufacturer = $carModel->manufacturer;

                return [
                    'model_name' => $carModel->model_name,
                    'manufacturer_name' => $manufacturer->manufacture_name,
                    'prices' => $groupedPrices->map(function ($price) {

                        $originalPrice = $price->price;
                        $serviceName = $price->service->service_name;

                        // Apply different discounts based on service type
                        if ($serviceName === "شامل") {
                            $discountedPrice = $originalPrice + 200; // 10% discount
                            $discountPercent = 100;
                            $discountUnit = "ريال";
                        } elseif ($serviceName === "أساسي") {
                            $discountedPrice = $originalPrice + 200; // 0% discount
                            $discountPercent = 100;
                            $discountUnit = "ريال";
                        } elseif ($serviceName === "محركات") {
                            $discountedPrice = $originalPrice + 200; // 0% discount
                            $discountPercent = 100;
                            $discountUnit = "ريال";
                        } else {
                            $discountedPrice = $originalPrice; // No discount
                            $discountPercent = 0;
                            $discountUnit = "ريال";
                        }


                        return [
                            'service_name' => $serviceName,
                            'price' => number_format($discountedPrice, 2, '.', ''), // Price after dicount (if exist)
                            'original_price' => number_format($originalPrice + 300, 2, '.', ''), // Price before dicount (if exist)
                            'discount_percent' => $discountPercent,
                            'discount_unit' => $discountUnit,
                            'you_save' => number_format(100, 2, '.', ''),
                        ];
                    }),
                ];
            });

        return response()->json($prices->values());
    }


    /**
     * Get discounted prices (50% off) for specific model and year
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getAllPlansWith50PercentDiscount(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'car_model_id' => 'required|exists:car_models,id',
            'year_id' => 'required|exists:year_of_manufactures,id',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 400);
        }

        $carModelId = $request->query('car_model_id');
        $yearId = $request->query('year_id');

        $prices = Price::with(['service', 'carModel.manufacturer'])
            ->where('car_model_id', $carModelId)
            ->where('year_id', $yearId)
            ->get()
            ->groupBy('car_model_id')
            ->map(function ($groupedPrices) {
                $carModel = $groupedPrices->first()->carModel;
                $manufacturer = $carModel->manufacturer;

                return [
                    'model_name' => $carModel->model_name,
                    'manufacturer_name' => $manufacturer->manufacture_name,
                    'prices' => $groupedPrices->map(function ($price) {

                        $originalPrice = $price->price;
                        $serviceName = $price->service->service_name;

                        // Apply different discounts based on service type
                        if ($serviceName === "شامل") {
                            $discountedPrice = $originalPrice * 0.5; // 50% discount
                            $discountPercent = 50;
                        } elseif ($serviceName === "أساسي") {
                            $discountedPrice = $originalPrice * 0.5; // 50% discount
                            $discountPercent = 50;
                        } elseif ($serviceName === "محركات") {
                            $discountedPrice = $originalPrice * 0.5; // 50% discount
                            $discountPercent = 50;
                        } else {
                            $discountedPrice = $originalPrice * 0.5; // 50% discount
                            $discountPercent = 50;
                        }


                        return [
                            'service_name' => $serviceName,
                            'price' => number_format($discountedPrice, 2, '.', ''), // Price after dicount (if exist)
                            'original_price' => number_format($originalPrice, 2, '.', ''), // Price before dicount (if exist)
                            'discount_percent' => $discountPercent,
                            'you_save' => number_format($originalPrice - $discountedPrice, 2, '.', ''),
                        ];
                    }),
                ];
            });

        return response()->json($prices->values());
    }

    /**
     * Get passenger services data with dynamic pricing
     */
    public function getPassengerServices()
    {
        $passengerServices = collect([
            [
                "service_name" => "luxury",
                "original_price" => 200.00,
                "discount_percent" => 0,
            ],
            [
                "service_name" => "suv",
                "original_price" => 150.00,
                "discount_percent" => 0,
            ],
            [
                "service_name" => "sedan",
                "original_price" => 100.00,
                "discount_percent" => 0,
            ]
        ]);

        $processedServices = $passengerServices->map(function ($service) {
            $originalPrice = $service['original_price'];
            $discountPercent = $service['discount_percent'];
            $youSave = ($discountPercent / 100) * $originalPrice;
            $finalPrice = $originalPrice - $youSave;

            return [
                "service_name" => $service['service_name'],
                "original_price" => number_format($originalPrice, 2),
                "discount_percent" => $discountPercent,
                "price" => number_format($finalPrice, 2),
                "you_save" => number_format($youSave, 2)
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $processedServices,
            'message' => 'Passenger services retrieved successfully'
        ]);
    }

    // Mshrai App
    // All plans prices by model id and year id
    public function forMshraiAppGetDiscountedPricesByModelAndYear(Request $request, $modelId, $yearId)
    {
        // Validate the route parameters
        $validator = Validator::make(['car_model_id' => $modelId, 'year_id' => $yearId], [
            'car_model_id' => 'required|exists:car_models,id',
            'year_id' => 'required|exists:year_of_manufactures,id',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 400);
        }

        // Fetch prices with related models
        $prices = Price::with(['service', 'carModel.manufacturer'])
            ->where('car_model_id', $modelId)
            ->where('year_id', $yearId)
            ->get()
            ->groupBy('car_model_id')
            ->map(function ($groupedPrices) use ($yearId, $modelId) {
                $carModel = $groupedPrices->first()->carModel;
                $manufacturer = $carModel->manufacturer;

                // Filter and map prices
                $filteredPrices = $groupedPrices->filter(function ($price) {
                    // Exclude prices for "هيكل خارجي" and "كمبيوتر"
                    return !in_array($price->service->service_name, ["هيكل خارجي", "كمبيوتر"]);
                })->map(function ($price) {
                    // Apply discount if applicable
                    $discountedPrice = $price->service->service_name === "شامل"
                        ? $price->price * 0.8 // Apply 20% discount
                        : $price->price;

                    // Assign IDs based on service_name
                    $serviceId = match ($price->service->service_name) {
                        "أساسي" => 1,
                        "محركات" => 2,
                        default => 0, // Default value
                    };

                    return [
                        'price_id' => $serviceId, // Set the service ID based on service_name
                        'plan' => $price->service->service_name,
                        'price' => number_format($discountedPrice, 2, '.', ''), // No thousands separator
                    ];
                });

                return [
                    'manufacturer' => $manufacturer->manufacture_name,
                    'model' => $carModel->model_name,
                    'car_model_id' => $modelId,
                    'year_id' => $yearId,
                    'prices' => $filteredPrices,
                ];
            });

        return response()->json($prices->values());
    }
}
