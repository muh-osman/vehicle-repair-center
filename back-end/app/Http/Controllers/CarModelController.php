<?php

namespace App\Http\Controllers;

use App\Models\CarModel;
use Illuminate\Http\Request;

class CarModelController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $carModels = CarModel::all();
        return response()->json(['carModels' => $carModels], 200);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'model_name' => 'required|string|max:255',
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
        return response()->json(['carModel' => $carModel], 200);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, CarModel $carModel)
    {
        $request->validate([
            'model_name' => 'required|string|max:255',
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
}
