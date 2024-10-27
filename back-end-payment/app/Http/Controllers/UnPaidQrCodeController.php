<?php

namespace App\Http\Controllers;

use App\Models\PaidQrCode;
use App\Models\UnPaidQrCode;
use Illuminate\Http\Request;

class UnPaidQrCodeController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        // Validate the incoming request data
        $validatedData = $request->validate([
            'un_paid_qr_code' => 'required|string|unique:un_paid_qr_codes,un_paid_qr_code',
            'full_name' => 'required|string|max:255',
            'phone' => 'required|string|max:20',
            'branch' => 'required|string|max:255',
            'plan' => 'required|string|max:255',
            'price' => 'required|numeric|min:0', // Ensure price is a number and >= 0
            'model' => 'required|string|max:255',
            'year' => 'required|string|max:255',
            'additionalServices' => 'nullable|string|max:255',
            'service' => 'nullable|string|max:255',
        ]);

        // Create a new UnPaidQrCode entry
        $unPaidQrCode = UnPaidQrCode::create($validatedData);

        // Return a response (could be a redirect or a JSON response)
        return response()->json([
            'message' => 'UnPaid QR Code created successfully',
            'data' => $unPaidQrCode,
        ], 201);
    }


    /**
     * Display the specified resource.
     */
    public function show($id) //  $id هو الرقم العشوائي الذي تم توليده وتخزرينه في العمود: "un_paid_qr_code"
    {
        // Find the UnPaidQrCode by the un_paid_qr_code value
        $unPaidQrCode = UnPaidQrCode::where('un_paid_qr_code', $id)->first();

        // Check if the record exists
        if (!$unPaidQrCode) {
            return response()->json([
                'message' => 'UnPaid QR Code not found',
            ], 404);
        }


        // Return the found record
        return response()->json([
            'message' => 'UnPaid QR Code retrieved successfully',
            'data' => $unPaidQrCode,
        ], 200);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, UnPaidQrCode $unPaidQrCode)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(UnPaidQrCode $unPaidQrCode)
    {
        //
    }

    /**
     * Get all QR codes from both paid and unpaid tables, ordered by created_at.
     */
    public function getAllQrCodes()
    {
        // Retrieve all records from both tables
        $paidQrCodes = PaidQrCode::all();
        $unPaidQrCodes = UnPaidQrCode::all();

        // Combine the results into a single collection
        $allQrCodes = $paidQrCodes->concat($unPaidQrCodes);

        // Sort the combined collection by created_at date
        $sortedQrCodes = $allQrCodes->sortBy('created_at');

        // Return the sorted data as a JSON response
        return response()->json($sortedQrCodes->values()->all(), 200);
    }
}
