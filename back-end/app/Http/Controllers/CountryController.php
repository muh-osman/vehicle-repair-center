<?php

namespace App\Http\Controllers;

use App\Models\Country;
use Illuminate\Http\Request;

use Illuminate\Validation\Rule;

class CountryController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        // $countries = Country::all();
        // return response()->json(['countries' => $countries], 200);

        $countries = Country::orderBy('country_name')->get();
        return response()->json(['countries' => $countries], 200);
    }


    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'country_name' => [
                'required',
                'string',
                'max:255',
                Rule::unique('countries', 'country_name'),
            ],
        ]);

        $country = Country::create([
            'country_name' => $request->country_name,
        ]);

        return response()->json(['country' => $country], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Country $country)
    {
        return response()->json(['country' => $country], 200);
    }


    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Country $country)
    {
        $request->validate([
            'country_name' => [
                'required',
                'string',
                'max:255',
                Rule::unique('countries', 'country_name')->ignore($country->id),
            ],
        ]);

        $country->update([
            'country_name' => $request->country_name,
        ]);

        return response()->json(['message' => 'Country updated successfully'], 200);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Country $country)
    {
        $country->delete();

        return response()->json(['message' => 'Country deleted successfully'], 200);
    }
}
