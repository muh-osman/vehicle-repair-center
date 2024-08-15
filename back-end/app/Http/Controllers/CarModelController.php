<?php

namespace App\Http\Controllers;

use App\Models\CarModel;
use Illuminate\Http\Request;

use Illuminate\Validation\Rule;

class CarModelController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $carModels = CarModel::orderBy('model_name')->get();
        return response()->json(['carModels' => $carModels], 200);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'model_name' => [
                'required',
                'string',
                'max:255',
                Rule::unique('car_models', 'model_name')
            ],
            'manufacturer_id' => 'required|exists:manufacturers,id'
        ]);

        $carModel = CarModel::create([
            'model_name' => $request->model_name,
            'manufacturer_id' => $request->manufacturer_id
        ]);

        return response()->json(['carModel' => $carModel], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(CarModel $carModel)
    {
        return response()->json(['carModel' => [$carModel]], 200);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, CarModel $carModel)
    {
        $request->validate([
            'model_name' => [
                'required',
                'string',
                'max:255',
                Rule::unique('car_models', 'model_name')->ignore($carModel->id)
            ],
            'manufacturer_id' => 'required|exists:manufacturers,id'
        ]);

        $carModel->update([
            'model_name' => $request->model_name,
            'manufacturer_id' => $request->manufacturer_id
        ]);

        return response()->json(['message' => 'Car model updated successfully'], 200);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(CarModel $carModel)
    {
        $carModel->delete();

        return response()->json(['message' => 'Car model deleted successfully'], 200);
    }

    /**
     * Get car models by manufacturer ID.
     */
    public function getModelsByManufacturerId($manufacturerId)
    {
        $carModels = CarModel::where('manufacturer_id', $manufacturerId)
            ->orderBy('model_name')
            ->get();

        if ($carModels->isEmpty()) {
            return response()->json(['message' => 'No car models found for the specified manufacturer ID'], 404);
        }

        return response()->json(['carModels' => $carModels], 200);
    }


    /**
     * For Dashboard website
     * Search for car models based on the search input.
     */
    public function searchModels(Request $request)
    {
        $searchInput = $request->input('search');

        $carModels = CarModel::where('model_name', 'like', $searchInput . '%')
            ->orderBy('model_name')
            ->get();


        // if ($carModels->isEmpty()) {
        //     return response()->json(['carModels' => 'No car models found for the specified search input'], 404);
        // }

        return response()->json(['carModels' => $carModels], 200);
    }

    /**
     * For WordPress website
     * Search for car models based on the search input and return only 10 results.
     */
    public function searchModelsLimited(Request $request)
    {
        // $searchInput = $request->input('search');

        // $carModels = CarModel::where('model_name', 'like', '%' . $searchInput . '%')
        //     ->orderBy('model_name')
        //     ->take(10) // Limit the results to 10
        //     ->get();

        // return response()->json(['carModels' => $carModels], 200);



        $searchInput = $request->input('search');

        // Normalize the search input for better matching
        $normalizedInput = preg_replace('/\s+/', '', mb_strtolower($searchInput));

        // Transliteration mapping (you can expand this as needed)
        $transliterationMap = [
            'مارس' => 'mercedes',
            'مارسي' => 'mercedes',
            'مارسيد' => 'mercedes',
            'مارسيدس' => 'mercedes',

            'مير' => 'mercedes',
            'ميرس' => 'mercedes',
            'ميرسي' => 'mercedes',
            'ميرسيد' => 'mercedes',
            'ميرسيدي' => 'mercedes',
            'ميرسيديس' => 'mercedes',

            'مرس' => 'mercedes',
            'مرسي' => 'mercedes',
            'مرسيد' => 'mercedes',
            'مرسيدس' => 'mercedes',

            'دي' => 'D Max',
            'ديما' => 'D Max',
            'ديماك' => 'D Max',
            'ديماكس' => 'D Max',

            'دو' => 'Charger',
            'دوج' => 'Charger',
            'دوج ت' => 'Charger',
            'دوج تش' => 'Charger',
            'دوج تشا' => 'Charger',
            'دوج تشار' => 'Charger',
            'دوج تشارج' => 'Charger',
            'دوج تشارجر' => 'Charger',

            'الان' => 'Elantra',
            'الانت' => 'Elantra',
            'الانتر' => 'Elantra',
            'الانترا' => 'Elantra',

            // Add more mappings as needed
        ];

        // Transliterate the search input
        $transliteratedInput = $transliterationMap[$searchInput] ?? $searchInput;

        $carModels = CarModel::where(function ($query) use ($searchInput, $normalizedInput, $transliteratedInput) {
            // Search for Arabic and English variations
            $query->where('model_name', 'like', '%' . $searchInput . '%')
                ->orWhere('model_name', 'like', '%' . $normalizedInput . '%')
                ->orWhere('model_name', 'like', '%' . $transliteratedInput . '%');
        })
            ->orderBy('model_name')
            ->take(10) // Limit the results to 10
            ->get();

        return response()->json(['carModels' => $carModels], 200);
    }
}
