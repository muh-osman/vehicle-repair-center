<?php

namespace App\Http\Controllers;

use App\Models\YearOfManufacture;
use Illuminate\Http\Request;

class YearOfManufactureController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $years = YearOfManufacture::all();
        return response()->json(['years' => $years], 200);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'year' => 'required|unique:year_of_manufactures'
        ]);

        $year = YearOfManufacture::create([
            'year' => $request->year
        ]);

        return response()->json(['year' => $year], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(YearOfManufacture $yearOfManufacture)
    {
        return response()->json(['year' => [$yearOfManufacture]], 200);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, YearOfManufacture $yearOfManufacture)
    {
        $request->validate([
            'year' => 'required|unique:year_of_manufactures,year,' . $yearOfManufacture->id
        ]);

        $yearOfManufacture->update([
            'year' => $request->year
        ]);

        return response()->json(['message' => 'Year updated successfully'], 200);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(YearOfManufacture $yearOfManufacture)
    {
        $yearOfManufacture->delete();

        return response()->json(['message' => 'Year deleted successfully'], 200);
    }

    public function getYearsByCarModel($carModelId)
    {
        $years = YearOfManufacture::whereHas('carModel', function ($query) use ($carModelId) {
            $query->where('id', $carModelId);
        })->get();

        return response()->json(['years' => $years], 200);
    }
}
