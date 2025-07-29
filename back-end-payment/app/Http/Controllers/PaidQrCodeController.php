<?php

namespace App\Http\Controllers;


use App\Models\PaidQrCode;
use Illuminate\Http\Request;

use App\Notifications\QrCodeStored;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Log;

class PaidQrCodeController extends Controller
{

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {

        // Validate the incoming request data
        $validatedData = $request->validate([
            'paid_qr_code' => 'required|string|unique:paid_qr_codes,paid_qr_code',
            'full_name' => 'nullable|string|max:255',
            'phone' => 'nullable|string|max:20',
            'branch' => 'nullable|string|max:255',
            'plan' => 'nullable|string|max:255',
            'price' => 'nullable|numeric|min:0', // Ensure price is a number and >= 0
            'model' => 'nullable|string|max:255',
            'year' => 'nullable|string|max:255',
            'additionalServices' => 'nullable|string|max:255',
            'service' => 'nullable|string|max:255',
            'affiliate' => 'nullable|string|max:255',
            'discountCode' => 'nullable|string|max:255',
            'marketerShare' => 'nullable|numeric|min:0',
            'full_year' => 'nullable|string|max:255',
        ]);

        // Secret Key
        $apiKey = env('PAYMENT_GETWAY_SECRET_LIVE_KEY');

        $response = Http::withBasicAuth($apiKey, '')
            ->get("https://api.moyasar.com/v1/payments/{$validatedData['paid_qr_code']}");

        if ($response->successful()) {
            $responseData = $response->json();
            $metadata = $responseData['metadata'] ?? [];

            // Check if the QR code already exists
            $qrCode = PaidQrCode::where('paid_qr_code', $validatedData['paid_qr_code'])->first();

            if (!$qrCode) {
                // Create a new PaidQrCode entry
                $qrCode = PaidQrCode::create([
                    'paid_qr_code' => $validatedData['paid_qr_code'],
                    'full_name' => $metadata['name'] ?? null,
                    'phone' => $metadata['phone'] ?? null,
                    'branch' => $metadata['branch'] ?? null,
                    'plan' => $metadata['plan'] ?? null,
                    'price' => $metadata['price'] ?? 0, // Default to 0 if not present
                    'model' => $metadata['model'] ?? null,
                    'year' => $metadata['year'] ?? null,
                    'additionalServices' => $metadata['additionalServices'] ?? null,
                    'service' => $metadata['service'] ?? null,
                    'affiliate' => $metadata['affiliate'] ?? null,
                    'discountCode' => $metadata['dc'] ?? null,
                    'marketerShare' => $metadata['msh'] ?? null,
                    'full_year' => $metadata['fy'] ?? null,
                    'date_of_visited' => null, // Set date_of_visited to null
                ]);

                // Send notification to multiple recipients
                $recipients = ['omar.cashif@gmail.com', 'cashif.acct@gmail.com', 'cashif2020@gmail.com', 'talalmeasar55@gmail.com'];
                // $recipients = ['song415400@gmail.com',]; // Replace with actual email addresses

                $paymentMethod = "Moyasar";

                // Prepare the data to pass to the notification
                $notificationData = array_merge($qrCode->toArray(), [
                    'payment_method' => $paymentMethod,
                    'service' => $metadata['service'] ?? null,
                    'additionalServices' => $metadata['additionalServices'] ?? null,
                    'branch' => $metadata['branch'] ?? null,
                    'plan' => $metadata['plan'] ?? null,
                    'model' => $metadata['model'] ?? null,
                    'full_name' => $metadata['name'] ?? null, // Use name from metadata
                    'phone' => $metadata['phone'] ?? null, // Use phone from metadata
                ]);

                try {
                    Notification::route('mail', $recipients)
                        ->notify(new QrCodeStored($notificationData));
                } catch (\Exception $e) {
                    // Log the error or handle it as needed
                    Log::error('Email notification failed: ' . $e->getMessage());
                    // You can also choose to notify the user about the failure if needed
                }

                return response()->json([
                    'message' => 'QR code stored successfully',
                    'exists' => false,
                    'data' => $qrCode
                ], 201); // Return 201 Created status
            } else {
                // If it exists, return a message indicating so along with the created_at date
                return response()->json([
                    'message' => 'QR code already exists',
                    'exists' => true,
                    'created_at' => $qrCode->created_at,
                    'data' => $qrCode
                ]);
            }
        } else {
            return response()->json(['error' => 'Payment not found'], 404);
        }
    }


    /**
     * Display the specified resource.
     */
    public function show($id) // $id is: رقم الفاتورة
    {
        // Validate the ID
        if (empty($id) || !is_string($id)) {
            return response()->json(['error' => 'Invalid ID provided'], 400);
        }

        // Check if the QR code exists in the database
        $qrCodeExist  = PaidQrCode::where('paid_qr_code', $id)->first();

        if (!$qrCodeExist) {
            return response()->json(['error' => 'QR code not found in the database'], 404);
        }

        // Secret Key
        $apiKey = env('PAYMENT_GETWAY_SECRET_LIVE_KEY');

        try {
            $response = Http::withBasicAuth($apiKey, '')
                ->get("https://api.moyasar.com/v1/payments/{$id}");

            if ($response->successful()) {
                $responseData = $response->json();

                // Find the corresponding PaidQrCode entry
                $qrCode = PaidQrCode::where('paid_qr_code', $id)->first();

                // Append date_of_visited to the response data before updating
                if ($qrCode) {
                    $responseData['date_of_visited'] = $qrCode->date_of_visited; // Add current date_of_visited to response
                }

                // Update the date_of_visited only if it is null
                if ($qrCode && is_null($qrCode->date_of_visited)) {
                    $qrCode->date_of_visited = now(); // Set to current date and time
                    $qrCode->save(); // Save the updated record


                    // Marketer API
                    // Check if discountCode and marketerShare are not null
                    if (!is_null($qrCode->discountCode) && !is_null($qrCode->marketerShare)) {
                        // Prepare data for the API Marketer request
                        $data = [
                            'id' => 0,
                            'code' => $qrCode->discountCode, // Assuming discountCode is already set
                            'points' => (int) $qrCode->marketerShare, // Assuming marketerShare is already set
                            'clientId' => 0,
                            'cardCountFromSite' => 0,
                            'isActive' => true
                        ];

                        // Make the API request
                        try {
                            $res = Http::withHeaders([
                                'Content-Type' => 'application/json-patch+json',
                            ])->put("https://cashif-001-site1.dtempurl.com/api/Marketers", $data);

                            // Optionally handle the response from the API
                            if ($res->successful()) {
                                Log::info('API request successful', [
                                    'response' => $res->json(), // Log the response data
                                ]);
                            } else {
                                Log::error('API request failed', [
                                    'status' => $res->status(),
                                    'response' => $res->json(), // Log the error response data
                                ]);
                            }
                        } catch (\Exception $e) {
                            // Handle any exceptions that may occur during the request
                            Log::error('Error occurred while making API request', [
                                'message' => $e->getMessage(),
                            ]);
                            // Handle any exceptions that may occur during the request
                            return response()->json([
                                'message' => 'Error occurred while making API request: ' . $e->getMessage(),
                            ], 500);
                        }
                    }
                }

                return response()->json($responseData); // Return the modified response
            } elseif ($response->status() == 404) {
                return response()->json(['error' => 'Payment not found'], 404);
            } else {
                return response()->json(['error' => 'An error occurred while retrieving payment data'], $response->status());
            }
        } catch (\Exception $e) {
            return response()->json(['error' => 'An unexpected error occurred: ' . $e->getMessage()], 500);
        }
    }
}
