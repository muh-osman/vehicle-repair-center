<?php

namespace App\Http\Controllers;

use App\Models\TabbyPaidClient;
use Illuminate\Http\Request;

use App\Notifications\QrCodeStored;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;

class TabbyPaidClientController extends Controller
{

    // checkout function (this method will call the tabby api to create a checkout session and redirect the user to tabby checkout page)
    public function processPayment(Request $request)
    {
        // Get the order data directly from the request
        $orderData = $request->all(); // This will take all the data sent from the front-end

        // Get the Tabby Secret Key from the .env file
        $tabbySecretKey = env('TABBY_SECRET_KEY');

        // Call the tabby API
        try {
            $response = Http::withToken($tabbySecretKey)
                ->post('https://api.tabby.ai/api/v2/checkout', $orderData);

            if ($response->failed()) {
                return response()->json(['error' => 'Payment processing failed'], 500);
            }

            $checkoutSession = $response->json();
            $webUrl = $checkoutSession['configuration']['available_products']['installments'][0]['web_url'] ?? null;

            // Redirect to tabby checkout page
            return response()->json(['checkout_url' => $webUrl]);
        } catch (\Exception $e) {
            return response()->json(['error' => 'An error occurred while processing the payment'], 500);
        }
    }


    public function tabbyWebhook(Request $request)
    {
        // Get the data from the request
        $data = $request->all();

        Log::info('Tabby data: ' . json_encode($data));

        // Check if the status is "authorized" and closed_at is null
        if (isset($data['status']) && $data['status'] === 'authorized' && is_null($data['closed_at'])) {
            // Capture the payment
            $captureResponse = $this->capturePayment($data['id'], $request->input('amount'));

            // Check if the capture was successful
            if ($captureResponse['success']) {
                Log::info('Tabby Payment captured successfully for ID: ' . $data['id']);
            } else {
                Log::error('Tabby Payment capture failed for ID: ' . $data['id'] . ' - ' . $captureResponse['error']);
            }
        }

        // Check if the status is "closed"
        if (isset($data['status']) && $data['status'] === 'closed' && !is_null($data['closed_at'])) {
            // Get the order ID
            $orderId = $data['id'];

            // Fetch the full order details from the Tabby API
            $orderDetailsResponse = $this->getOrderDetails($orderId);

            if ($orderDetailsResponse['success']) {
                $orderDetails = $orderDetailsResponse['data'];

                // Parse the description string
                $description = $orderDetails['description'] ?? '';
                parse_str($description, $parsedDescription);

                // Extract necessary fields from the parsed description
                $fullname = $parsedDescription['fullname'] ?? null;
                $phone = $parsedDescription['phone'] ?? null;
                $branch = $parsedDescription['branch'] ?? null;
                $plan = $parsedDescription['plan'] ?? null;
                $price = $parsedDescription['price'] ?? 0; // Use the amount from the order details
                $model = $parsedDescription['model'] ?? null;
                $yearId = $parsedDescription['yearId'] ?? null;
                $additionalServices = $parsedDescription['additionalServices'] ?? null;
                $service = $parsedDescription['service'] ?? null; // Adjust based on actual structure
                $affiliate = $parsedDescription['affiliate'] ?? null; // Adjust based on actual structure
                $discountCode = $parsedDescription['dc'] ?? null; // Adjust based on actual structure
                $marketerShare = $parsedDescription['msh'] ?? null; // Adjust based on actual structure
                $fullYear = $parsedDescription['fy'] ?? null; // Adjust based on actual structure
                $clientId = $parsedDescription['cd'] ?? null; // Adjust based on actual structure
                $redeemeAmoumntValue = $parsedDescription['rv'] ?? 0; // Adjust based on actual structure

                $address = $parsedDescription['ad'] ?? null;

                // Store the data in the database
                $this->storeClosedOrderData($orderId, $fullname, $phone, $branch, $plan, $price, $model, $yearId, $additionalServices, $service, $affiliate, $discountCode, $marketerShare, $fullYear, $clientId, $redeemeAmoumntValue, $address);
            } else {
                Log::error('Failed to fetch order details for ID: ' . $orderId);
            }
        }

        return response()->json(['message' => 'Webhook processed successfully'], 200);
    }

    private function getOrderDetails($orderId)
    {
        // Get the Tabby Secret Key from the .env file
        $tabbySecretKey = env('TABBY_SECRET_KEY');

        try {
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $tabbySecretKey,
                'Content-Type' => 'application/json',
            ])->get("https://api.tabby.ai/api/v2/payments/{$orderId}");

            if ($response->successful()) {
                // Log the successful response data
                Log::info('Successfully fetched order details for ID: ' . $orderId, [
                    'data' => $response->json() // Log the entire response data
                ]);
                return ['success' => true, 'data' => $response->json()];
            } else {
                Log::error('Error fetching order details', [
                    'orderId' => $orderId,
                    'status' => $response->status(),
                    'response' => $response->body(),
                ]);
                return ['success' => false];
            }
        } catch (\Exception $e) {
            Log::error('Exception while fetching order details', [
                'orderId' => $orderId,
                'error' => $e->getMessage(),
            ]);
            return ['success' => false];
        }
    }

    private function storeClosedOrderData($orderId, $fullname, $phone, $branch, $plan, $price, $model, $yearId, $additionalServices, $service, $affiliate, $discountCode, $marketerShare, $fullYear, $clientId, $redeemeAmoumntValue, $address)
    {
        Log::info('Start store Tabby Payment orderId: ' . $orderId);
        // Check if the order already exists
        $existingOrder = TabbyPaidClient::where('paid_qr_code', $orderId)->first();

        if (!$existingOrder) {
            // Create a new TabbyPaidClient entry
            $newOrder = TabbyPaidClient::create([
                'paid_qr_code' => $orderId,
                'full_name' => $fullname,
                'phone' => $phone,
                'branch' => $branch,
                'plan' => $plan,
                'price' => $price,
                'model' => $model,
                'year' => $yearId,
                'additionalServices' => $additionalServices,
                'service' => $service ?? null,
                'affiliate' => $affiliate ?? null,
                'discountCode' => $discountCode ?? null,
                'marketerShare' => $marketerShare ?? null,
                'full_year' => $fullYear ?? null,
                'clientId' => $clientId ?? null,
                'redeemeAmoumntValue' => $redeemeAmoumntValue ?? 0,
                'address' => $address ?? null,
                'date_of_visited' => null,
            ]);

            /**
             * ✅ LOTTERY API CALL (MAKE is_discount_used true)
             */
            if (!empty($phone)) {
                try {
                    $lotteryResponse = Http::timeout(5)
                        ->retry(1, 200)
                        ->get("https://cashif.online/back-end/public/api/lottery/{$phone}");

                    if ($lotteryResponse->successful()) {
                        Log::info('Lottery discount marked as used (Tabby)', [
                            'phone' => $phone,
                            'response' => $lotteryResponse->json(),
                        ]);
                    } else {
                        Log::warning('Lottery discount API responded with error (Tabby)', [
                            'phone' => $phone,
                            'status' => $lotteryResponse->status(),
                            'response' => $lotteryResponse->body(),
                        ]);
                    }
                } catch (\Exception $e) {
                    Log::error('Lottery discount API call failed (Tabby)', [
                        'phone' => $phone,
                        'error' => $e->getMessage(),
                    ]);
                }
            }

            // Make API request if redeemeAmoumntValue > 0
            if ($redeemeAmoumntValue > 0 && !empty($clientId)) {
                $this->updateClientPoints($clientId, $redeemeAmoumntValue);
            }

            // Send notification to recipients
            $recipients = ['omar.cashif@gmail.com', 'cashif.acct@gmail.com', 'cashif2020@gmail.com', 'talalmeasar55@gmail.com'];
            // $recipients = ['gp415400@gmail.com'];

            $paymentMethod = "Tabby";

            // Prepare the data to pass to the notification
            $notificationData = array_merge($newOrder->toArray(), [
                // 'service' => $service ?? null,
                'payment_method' => $paymentMethod,
                // 'additionalServices' => $additionalServices ?? null,
                // 'branch' => $branch ?? null,
                // 'plan' => $plan ?? null,
                // 'model' => $model ?? null,
                // 'full_name' => $fullname ?? null,
                // 'phone' => $phone ?? null,
                // 'discountCode' => $discountCode ?? null,
                // 'address' => $address ?? null,
                // 'full_year' => $fullYear ?? null,
            ]);
            try {
                Notification::route('mail', $recipients)
                    ->notify(new QrCodeStored($notificationData));
            } catch (\Exception $e) {
                Log::error('Email notification failed: ' . $e->getMessage());
            }

            // Log successful store
            \Log::info("Tabby payment store successful for order: {$orderId}");
        } else {
            // If it exists, log that the order already exists
            \Log::info("Tabby payment already exists for order: {$orderId}");
        }
    }


    private function updateClientPoints($clientId, $redeemeAmoumntValue)
    {
        try {
            $dataPayload = [
                "clientId" => (int)$clientId,
                "points" => (int)$redeemeAmoumntValue
            ];

            $response = Http::withHeaders([
                'Content-Type' => 'application/json-patch+json',
            ])->put("https://cashif-001-site1.dtempurl.com/api/Clients/UpdateClientPointDto", $dataPayload);

            if ($response->successful()) {
                Log::info('Client points updated successfully', [
                    'clientId' => $clientId,
                    'points' => $redeemeAmoumntValue,
                    'response' => $response->json(),
                ]);
            } else {
                Log::error('Failed to update client points', [
                    'clientId' => $clientId,
                    'points' => $redeemeAmoumntValue,
                    'status' => $response->status(),
                    'response' => $response->body(),
                ]);
            }
        } catch (\Exception $e) {
            Log::error('Error occurred while updating client points', [
                'clientId' => $clientId,
                'points' => $redeemeAmoumntValue,
                'message' => $e->getMessage(),
            ]);
        }
    }


    private function capturePayment($paymentId, $amount)
    {

        // Get the Tabby Secret Key from the .env file
        $tabbySecretKey = env('TABBY_SECRET_KEY');

        Log::info('Start capture Tabby Payment paymentId: ' . $paymentId);

        try {
            $response = Http::withToken($tabbySecretKey)
                ->post("https://api.tabby.ai/api/v2/payments/{$paymentId}/captures", [
                    'amount' => $amount,
                ]);

            if ($response->successful()) {
                Log::info('Capture Tabby Payment Successfully');
                return ['success' => true];
            } else {
                // Log the failed response
                Log::error('Tabby payment capture failed', [
                    'paymentId' => $paymentId,
                    'amount' => $amount,
                    'response' => $response->body(),
                    'status' => $response->status()
                ]);
                return ['success' => false, 'error' => $response->body()];
            }
        } catch (\Exception $e) {
            // Log the exception
            Log::error('Tabby payment capture exception', [
                'paymentId' => $paymentId,
                'amount' => $amount,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return ['success' => false, 'error' => $e->getMessage()];
        }
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

        $qrCodeExist = TabbyPaidClient::where('paid_qr_code', $id)->first();

        if (!$qrCodeExist) {
            return response()->json(['error' => 'QR code not found in the database'], 404);
        }

        try {
            // Get the Tabby Secret Key from the .env file
            $tabbySecretKey = env('TABBY_SECRET_KEY');

            // Get Order Status from Tabby API
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $tabbySecretKey,
                'Content-Type' => 'application/json',
            ])->get("https://api.tabby.ai/api/v2/payments/{$id}");

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

                $clientId = $data['cd'] ?? null;
                $redeemeAmoumntValue = $data['rv'] ?? 0;
                $address = $data['ad'] ?? null;



                // Find the corresponding PaidQrCode entry
                $qrCode = TabbyPaidClient::where('paid_qr_code', $id)->first();

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
                        'clientId' => $clientId,
                        'redeemeAmoumntValue' => $redeemeAmoumntValue,
                        'address' => $address,
                        'date_of_visited' => $responseData['date_of_visited'],
                    ],
                    'tabby' => $responseData
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
