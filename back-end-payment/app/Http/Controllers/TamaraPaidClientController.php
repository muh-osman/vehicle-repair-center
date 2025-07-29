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


    // checkout function (this method will call the tamara api to create a checkout session and redirect the user to tamara checkout page)
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
     * This method will take (orderId) from Tamara webhook " then "Authorise" it using Tamara API.
     */
    public function authorizeWebhook(Request $request)
    {
        \Log::info('Tamara authorization Webhook received:', $request->all());

        $orderId = $request->input('order_id');
        $eventType = $request->input('event_type');

        if ($eventType == 'order_approved') {
            try {
                // Authorize the order using Tamara API
                $authorizeResponse = Http::withHeaders([
                    'Authorization' => 'Bearer ' . env('TAMARA_API_TOKEN'),
                    'Content-Type' => 'application/json',
                ])->post(env('TAMARA_API_URL') . "/orders/{$orderId}/authorise");

                if ($authorizeResponse->failed()) {
                    // Log the detailed error response
                    \Log::error('Tamara Authorization Failed', [
                        'order_id' => $orderId,
                        'status' => $authorizeResponse->status(),
                        'response' => $authorizeResponse->body()
                    ]);

                    throw new \Exception("Authorization failed! Status: " . $authorizeResponse->status(), $authorizeResponse->status());
                }

                // If authorization is successful
                \Log::info('Tamara Order Authorized Successfully', [
                    'order_id' => $orderId,
                    'response' => $authorizeResponse->body()
                ]);

                return response()->json(['status' => 'success'], 200);
            } catch (\Exception $e) {
                // Log the full exception details
                \Log::error('Tamara Webhook Authorization Error', [
                    'message' => $e->getMessage(),
                    'trace' => $e->getTraceAsString(),
                    'order_id' => $orderId
                ]);

                // Return an error response
                return response()->json([
                    'status' => 'error',
                    'message' => 'Failed to authorize order: ' . $e->getMessage()
                ], 500);
            }
        }

        // If event type is not order_approved
        \Log::info('Received non-approved event', [
            'event_type' => $eventType
        ]);

        return response()->json(['status' => 'ignored'], 200);
    }

    // this method will take (orderId) from Tamara webhook then use "Get the order status api" to take the "amount" then "Capture" the payment then "Save" the data in the database
    public function captureWebhook(Request $request)
    {
        \Log::info('Tamara capture Webhook received:', $request->all());

        $orderId = $request->input('order_id');
        $eventType = $request->input('event_type');

        if ($eventType == 'order_authorised') {
            try {
                // Get order status using Tamara API to get the "amount"
                $statusResponse = Http::withHeaders([
                    'Authorization' => 'Bearer ' . env('TAMARA_API_TOKEN'),
                    'Content-Type' => 'application/json',
                ])->get(env('TAMARA_API_URL') . "/orders/{$orderId}");

                if ($statusResponse->failed()) {
                    throw new \Exception("Failed to get order status! Status: " . $statusResponse->status(), $statusResponse->status());
                }

                $orderStatus = $statusResponse->json();
                $amount = $orderStatus['total_amount']['amount'];

                // Capture the payment using Tamara API
                $captureResponse = Http::withHeaders([
                    'Authorization' => 'Bearer ' . env('TAMARA_API_TOKEN'),
                    'Content-Type' => 'application/json',
                ])->post(env('TAMARA_API_URL') . "/payments/capture", [
                    'order_id' => $orderId,
                    'total_amount' => [
                        'amount' => $amount,
                        'currency' => 'SAR',
                    ],
                    'shipping_info' => [
                        'shipped_at' => now()->toIso8601String(),
                        'shipping_company' => 'Cashif',
                    ],
                ]);

                if ($captureResponse->failed()) {
                    throw new \Exception("Capture failed! Status: " . $captureResponse->status(), $captureResponse->status());
                }

                // Log successful capture
                \Log::info("Tamara payment capture successful for order: {$orderId}");


                return response()->json(['status' => 'success'], 200);
            } catch (\Exception $e) {
                // Log the error
                \Log::error("Tamara Webhook Capture Error: " . $e->getMessage());

                // Return error response
                return response()->json([
                    'status' => 'error',
                    'message' => $e->getMessage()
                ], 400);
            }
        }

        // If event type is not 'order_authorised'
        return response()->json(['status' => 'ignored'], 200);
    }

    // this method will take (oderId) from Tamara webhook then use "Get the order status api" to take the "description" then "Save" the data in the database
    public function storeInDb(Request $request)
    {
        \Log::info('Tamara store Webhook received:', $request->all());

        $orderId = $request->input('order_id');
        $eventType = $request->input('event_type');

        if ($eventType == 'order_captured') {
            try {
                // Get order status using Tamara API to get the "description"
                $statusResponse = Http::withHeaders([
                    'Authorization' => 'Bearer ' . env('TAMARA_API_TOKEN'),
                    'Content-Type' => 'application/json',
                ])->get(env('TAMARA_API_URL') . "/orders/{$orderId}");

                if ($statusResponse->failed()) {
                    throw new \Exception("Failed to get order status! Status: " . $statusResponse->status(), $statusResponse->status());
                }

                $orderStatus = $statusResponse->json();
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
                $affiliate = $data['affiliate'] ?? null;
                $discountCode = $data['dc'] ?? null;
                $marketerShare = $data['msh'] ?? null;
                $fullYear = $data['fy'] ?? null;

                // Check if the QR code already exists
                $qrCode = TamaraPaidClient::where('paid_qr_code', $orderId)->first();

                if (!$qrCode) {
                    // Create a new TamaraPaidClient entry
                    $qrCode = TamaraPaidClient::create([
                        'paid_qr_code' => $orderId,
                        'full_name' => $fullname ?? null,
                        'phone' => $phone ?? null,
                        'branch' => $branch ?? null,
                        'plan' => $plan ?? null,
                        'price' => $price ?? 0,
                        'model' => $model ?? null,
                        'year' => $yearId ?? null,
                        'additionalServices' => $additionalServices ?? null,
                        'service' => $service ?? null,
                        'affiliate' => $affiliate ?? null,
                        'discountCode' => $discountCode ?? null,
                        'marketerShare' => $marketerShare ?? null,
                        'full_year' => $fullYear ?? null,
                        'date_of_visited' => null,
                    ]);

                    // Send notification to recipients
                    $recipients = ['omar.cashif@gmail.com', 'cashif.acct@gmail.com', 'cashif2020@gmail.com', 'talalmeasar55@gmail.com'];

                    $paymentMethod = "Tamara";

                    // Prepare the data to pass to the notification
                    $notificationData = array_merge($qrCode->toArray(), [
                        'payment_method' => $paymentMethod,
                        'service' => $service ?? null,
                        'additionalServices' => $additionalServices ?? null,
                        'branch' => $branch ?? null,
                        'plan' => $plan ?? null,
                        'model' => $model ?? null,
                        'full_name' => $fullname ?? null,
                        'phone' => $phone ?? null,
                    ]);

                    try {
                        Notification::route('mail', $recipients)
                            ->notify(new QrCodeStored($notificationData));
                    } catch (\Exception $e) {
                        Log::error('Email notification failed: ' . $e->getMessage());
                    }

                    // Log successful store
                    \Log::info("Tamara payment store successful for order: {$orderId}");

                    return response()->json(['status' => 'success'], 201); // 201 Created
                } else {
                    // If it exists, return a message indicating so along with the created_at date
                    \Log::info("Tamara payment already exists for order: {$orderId}");

                    return response()->json([
                        'status' => 'exists',
                        'created_at' => $qrCode->created_at,
                        'data' => $qrCode
                    ]);
                }
            } catch (\Exception $e) {
                // Log the error
                \Log::error("Tamara Webhook Store Error: " . $e->getMessage());

                // Return error response
                return response()->json([
                    'status' => 'error',
                    'message' => $e->getMessage()
                ], 400);
            }
        }

        // If event type is not 'order_captured'
        return response()->json(['status' => 'ignored'], 200);
    }



    /**
     * this method for (cashif.online) dashboard
     * Display the specified resource.
     */
    public function show($id) // id is "orderId"
    {
        // Validate the ID
        if (empty($id) || !is_string($id)) {
            return response()->json(['error' => 'Invalid ID provided'], 400);
        }

        $qrCodeExist = TamaraPaidClient::where('paid_qr_code', $id)->first();

        if (!$qrCodeExist) {
            return response()->json(['error' => 'QR code not found in the database'], 404);
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
                $affiliate = $data['affiliate'] ?? null;
                $discountCode = $data['dc'] ?? null;
                $marketerShare = $data['msh'] ?? null;
                $fullYear = $data['fy'] ?? null;



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


                    // Marketer API
                    // Check if discountCode and marketerShare are not null
                    if (!is_null($qrCode->discountCode) && !is_null($qrCode->marketerShare)) {
                        // Prepare data for the API Marketer request
                        $dataPayload = [
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
                            ])->put("https://cashif-001-site1.dtempurl.com/api/Marketers", $dataPayload);

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
                        'affiliate' => $affiliate,
                        'discountCode' => $discountCode,
                        'marketerShare' => $marketerShare,
                        'full_year' => $fullYear,
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
