<?php

namespace App\Http\Controllers;

use App\Models\TamaraPaidClient;
use Illuminate\Http\Request;
use App\Notifications\QrCodeStored;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;

class TamaraPaidClientController extends Controller
{


    // checkout function to process the payment and redirect to tamara che
    public function processPayment(Request $request)
    {
        // Get the order data directly from the request
        $orderData = $request->all(); // This will take all the data sent from the front-end

        // Call the Tamara API
        try {
            $response = Http::withToken(env('TAMARA_API_TOKEN'))
                ->post(env('TAMARA_API_URL') . '/checkout', $orderData);

            if ($response->failed()) {
                return response()->json(['error' => 'Payment processing failed'], 500);
            }

            $checkoutSession = $response->json();

            // Redirect to Tamara checkout page
            return response()->json(['checkout_url' => $checkoutSession['checkout_url']]);
        } catch (\Exception $e) {
            return response()->json(['error' => 'An error occurred while processing the payment'], 500);
        }
    }


    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        // Validate the incoming request data
        try {
            $validatedData = $request->validate([
                'paid_qr_code' => 'required|string|unique:tamara_paid_clients,paid_qr_code',
                'full_name' => 'nullable|string|max:255',
                'phone' => 'nullable|string|max:20',
                'branch' => 'nullable|string|max:255',
                'plan' => 'nullable|string|max:255',
                'price' => 'nullable|numeric|min:0',
                'model' => 'nullable|string|max:255',
                'year' => 'nullable|string|max:255',
                'additionalServices' => 'nullable|string|max:255',
                'service' => 'nullable|string|max:255',
            ]);
        } catch (ValidationException $e) {
            Log::error("Validation failed: " . $e->getMessage(), ['errors' => $e->errors()]);
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422); // 422 Unprocessable Entity
        }

        // Extract the orderId from the validated data
        $orderId = $validatedData['paid_qr_code'];

        try {
            // Authorize order
            $authorizeResponse = Http::withHeaders([
                'Authorization' => 'Bearer ' . env('TAMARA_API_TOKEN'),
                'Content-Type' => 'application/json',
            ])->post(env('TAMARA_API_URL') . "/orders/{$orderId}/authorise");

            if ($authorizeResponse->failed()) {
                throw new \Exception("Authorization failed! Status: " . $authorizeResponse->status(), $authorizeResponse->status());
            }

            $authoriseOrder = $authorizeResponse->json();

            // Capture payment
            $captureResponse = Http::withHeaders([
                'Authorization' => 'Bearer ' . env('TAMARA_API_TOKEN'),
                'Content-Type' => 'application/json',
            ])->post(env('TAMARA_API_URL') . "/payments/capture", [
                'order_id' => $authoriseOrder['order_id'],
                'total_amount' => [
                    'amount' => $authoriseOrder['authorized_amount']['amount'],
                    'currency' => 'SAR',
                ],
                'shipping_info' => [
                    'shipped_at' => '2024-03-31T19:19:52.677Z',
                    'shipping_company' => 'Cashif',
                ],
            ]);

            if ($captureResponse->failed()) {
                throw new \Exception("Capture failed! Status: " . $captureResponse->status(), $captureResponse->status());
            }

            $capturePayment = $captureResponse->json();

            // Get order status
            $statusResponse = Http::withHeaders([
                'Authorization' => 'Bearer ' . env('TAMARA_API_TOKEN'),
                'Content-Type' => 'application/json',
            ])->get(env('TAMARA_API_URL') . "/orders/{$orderId}");

            if ($statusResponse->failed()) {
                throw new \Exception("Failed to get order status! Status: " . $statusResponse->status(), $statusResponse->status());
            }

            $orderStatus = $statusResponse->json();

            // Extract description and convert to variables
            $description = $orderStatus['description'];
            parse_str($description, $data); // Parse the query string into an array

            // Assign variables
            $fullname = $data['fullname'] ?? null;
            $phone = $data['phone'] ?? null;
            $branch = $data['branch'] ?? null;
            $plan = $data['plan'] ?? null;
            $price = $data['price'] ?? 0;
            $model = $data['model'] ?? null;
            $yearId = $data['yearId'] ?? null;
            $additionalServices = $data['additionalServices'] ?? null;
            $service = $data['service'] ?? null;

            // Check if the QR code already exists
            $qrCode = TamaraPaidClient::where('paid_qr_code', $validatedData['paid_qr_code'])->first();

            if (!$qrCode) {
                // Create a new TamaraPaidClient entry
                $qrCode = TamaraPaidClient::create([
                    'paid_qr_code' => $validatedData['paid_qr_code'],
                    'full_name' => $fullname ?? null,
                    'phone' => $phone ?? null,
                    'branch' => $branch ?? null,
                    'plan' => $plan ?? null,
                    'price' => $price ?? 0,
                    'model' => $model ?? null,
                    'year' => $yearId ?? null,
                    'additionalServices' => $additionalServices ?? null,
                    'service' => $service ?? null,
                    'date_of_visited' => null,
                ]);

                // Send notification to recipients
                $recipients = ['omar.cashif@gmail.com', 'cashif.acct@gmail.com', 'cashif2020@gmail.com'];

                try {
                    Notification::route('mail', $recipients)
                        ->notify(new QrCodeStored($qrCode->toArray()));
                } catch (\Exception $e) {
                    Log::error('Email notification failed: ' . $e->getMessage());
                }

                return response()->json([
                    'message' => 'QR code stored successfully',
                    'exists' => false,
                    'data' => $qrCode
                ], 201); // 201 Created
            } else {
                // If it exists, return a message indicating so along with the created_at date
                return response()->json([
                    'message' => 'QR code already exists',
                    'exists' => true,
                    'created_at' => $qrCode->created_at,
                    'data' => $qrCode
                ]);
            }
        } catch (\Exception $error) {
            // Log the exception with additional context (e.g., orderId and request data)
            Log::error('Error in TamaraPaidClientController@store', [
                'message' => $error->getMessage(),
                'order_id' => $orderId,
                'stack' => $error->getTraceAsString(),
            ]);

            return response()->json([
                'message' => 'Internal Server Error',
                'error' => $error->getMessage()
            ], 500); // 500 Internal Server Error
        }
    }

    /**
     * Display the specified resource.
     */
    public function show($id) // id is "orderId"
    {
        // Validate the ID
        if (empty($id) || !is_string($id)) {
            return response()->json(['error' => 'Invalid ID provided'], 400);
        }

        try {
            // Get Order Status from Tamara API
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . env('TAMARA_API_TOKEN'),
                'Content-Type' => 'application/json',
            ])->get(env('TAMARA_API_URL') . "/orders/{$id}");

            if ($response->failed()) {
                throw new \Exception("Failed to get order status! Status: " . $response->status(), $response->status());
            }

            if ($response->successful()) {

                $responseData = $response->json();

                // Extract description and convert to variables
                $description = $responseData['description'];
                parse_str($description, $data); // Parse the query string into an array

                // Assign variables
                $fullname = $data['fullname'] ?? null;
                $phone = $data['phone'] ?? null;
                $branch = $data['branch'] ?? null;
                $plan = $data['plan'] ?? null;
                $price = $data['price'] ?? 0;
                $model = $data['model'] ?? null;
                $yearId = $data['yearId'] ?? null;
                $additionalServices = $data['additionalServices'] ?? null;
                $service = $data['service'] ?? null;


                // Find the corresponding PaidQrCode entry
                $qrCode = TamaraPaidClient::where('paid_qr_code', $id)->first();

                // Append date_of_visited to the response data before updating
                if ($qrCode) {
                    $responseData['date_of_visited'] = $qrCode->date_of_visited; // Add date_of_visited to response
                }

                // Update the date_of_visited only if it is null
                if ($qrCode && is_null($qrCode->date_of_visited)) {
                    $qrCode->date_of_visited = now(); // Set to current date and time
                    $qrCode->save(); // Save the updated record
                }
                // Return the modified response
                return response()->json([
                    'data' => [
                        'paid_qr_code' => $id, // Order ID
                        'full_name' => $fullname,
                        'phone' => $phone,
                        'branch' => $branch,
                        'plan' => $plan,
                        'price' => $price,
                        'model' => $model,
                        'year' => $yearId,
                        'additionalServices' => $additionalServices,
                        'service' => $service,
                        'date_of_visited' => $responseData['date_of_visited'],
                    ],
                    'tamara' => $responseData
                ]);
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
