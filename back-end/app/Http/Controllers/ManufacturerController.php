<?php

namespace App\Http\Controllers;

use App\Models\Manufacturer;
use Illuminate\Http\Request;

use Illuminate\Validation\Rule;

class ManufacturerController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        // $manufacturers = Manufacturer::all();
        // return response()->json(['manufacturers' => $manufacturers], 200);

        $manufacturers = Manufacturer::orderBy('manufacture_name')->get();
        return response()->json(['manufacturers' => $manufacturers], 200);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'manufacture_name' => [
                'required',
                'string',
                'max:255',
                Rule::unique('manufacturers')->where(function ($query) use ($request) {
                    return $query->where('manufacture_name', $request->manufacture_name);
                })
            ],
            'country_id' => 'required|exists:countries,id'
        ]);

        $manufacturer = Manufacturer::create([
            'manufacture_name' => $request->manufacture_name,
            'country_id' => $request->country_id
        ]);

        return response()->json(['manufacturer' => $manufacturer], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Manufacturer $manufacturer)
    {
        return response()->json(['manufacturers' => [$manufacturer]], 200);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Manufacturer $manufacturer)
    {
        $request->validate([
            'manufacture_name' => [
                'required',
                'string',
                'max:255',
                Rule::unique('manufacturers')->ignore($manufacturer->id)->where(function ($query) use ($request) {
                    return $query->where('manufacture_name', $request->manufacture_name);
                })
            ],
            'country_id' => 'required|exists:countries,id'
        ]);

        $manufacturer->update([
            'manufacture_name' => $request->manufacture_name,
            'country_id' => $request->country_id
        ]);

        return response()->json(['message' => 'Manufacturer updated successfully'], 200);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Manufacturer $manufacturer)
    {
        $manufacturer->delete();

        return response()->json(['message' => 'Manufacturer deleted successfully'], 200);
    }

    /**
     * Get manufacturers by country ID.
     */
    public function getManufacturersByCountry($countryId)
    {

        $manufacturers = Manufacturer::where('country_id', $countryId)
            ->orderBy('manufacture_name')
            ->get();

        if ($manufacturers->isEmpty()) {
            return response()->json(['message' => 'No manufacturers found for the given country ID'], 404);
        }

        return response()->json(['manufacturers' => $manufacturers], 200);
    }

    // Mshrai App
    // All Manufacturers
    public function allManufacturers()
    {
        $manufacturers = Manufacturer::orderBy('manufacture_name')->get();

        // Transform the collection to only include id and manufacture_name
        $manufacturers = $manufacturers->map(function ($manufacturer) {
            return [
                'id' => $manufacturer->id,
                'manufacture_name' => $manufacturer->manufacture_name,
            ];
        });

        return response()->json(['manufacturers' => $manufacturers], 200);
    }
}
