<?php

namespace App\Http\Controllers;

use App\Models\PhoneNumber;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;


class PhoneNumberController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $phoneNumbers = PhoneNumber::all();
        return response()->json([
            'status' => 'success',
            'data' => $phoneNumbers
        ]);
    }



    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'accepted_phone_number' => 'required|string|unique:phone_numbers|max:20'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'errors' => $validator->errors()
            ], 422);
        }

        $phoneNumber = PhoneNumber::create([
            'accepted_phone_number' => $request->accepted_phone_number
        ]);

        return response()->json([
            'status' => 'success',
            'data' => $phoneNumber
        ], 201);
    }



    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        $phoneNumber = PhoneNumber::find($id);

        if (!$phoneNumber) {
            return response()->json([
                'status' => 'error',
                'message' => 'Phone number not found'
            ], 404);
        }

        $phoneNumber->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Phone number deleted successfully'
        ]);
    }
}
