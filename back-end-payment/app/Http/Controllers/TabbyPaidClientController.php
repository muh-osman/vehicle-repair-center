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

        // Check if the status is "authorized" and closed_at is null
        if (isset($data['status']) && $data['status'] === 'authorized' && is_null($data['closed_at'])) {
            // Capture the payment
            $captureResponse = $this->capturePayment($data['id'], $request->input('amount'));

            // Check if the capture was successful
            if ($captureResponse['success']) {
                // Log::info('Payment captured successfully for ID: ' . $data['id']);
            } else {
                // Log::error('Payment capture failed for ID: ' . $data['id'] . ' - ' . $captureResponse['error']);
            }
        }

        // Check if the status is "closed"
        if (isset($data['status']) && $data['status'] === 'closed' && !is_null($data['closed_at'])) {
            // Parse the description to extract data
            $description = $data['description'] ?? '';
            parse_str($description, $parsedData); // Parse the query string into an array

            // Assign variables
            $fullname = $parsedData['fullname'] ?? null;
            $phone = $parsedData['phone'] ?? null;
            $plan = $parsedData['plan'] ?? null;
            $branch = $parsedData['branch'] ?? null;
            $price = $parsedData['price'] ?? 0;
            $model = $parsedData['model'] ?? null;
            $yearId = $parsedData['yearId'] ?? null;
            $additionalServices = $parsedData['additionalServices'] ?? null;
            $service = $parsedData['service'] ?? null;

            // Store the data in the database
            $this->storeClosedOrderData($data['id'], $fullname, $phone, $branch, $plan, $price, $model, $yearId, $additionalServices, $service);
        }

        return response()->json(['message' => 'Webhook processed successfully'], 200);
    }

    private function storeClosedOrderData($orderId, $fullname, $phone, $branch, $plan, $price, $model, $yearId, $additionalServices, $service)
    {
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
                'date_of_visited' => null,
            ]);


            // Send notification to recipients
            $recipients = ['omar.cashif@gmail.com', 'cashif.acct@gmail.com', 'cashif2020@gmail.com'];

            try {
                Notification::route('mail', $recipients)
                    ->notify(new QrCodeStored($newOrder->toArray()));
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


    private function capturePayment($paymentId, $amount)
    {

        // Get the Tabby Secret Key from the .env file
        $tabbySecretKey = env('TABBY_SECRET_KEY');

        // Log::info('paymentId: ' . $paymentId);
        // Log::info('amount: ' . $amount);
        try {
            $response = Http::withToken($tabbySecretKey)
                ->post("https://api.tabby.ai/api/v2/payments/{$paymentId}/captures", [
                    'amount' => $amount,
                ]);

            if ($response->successful()) {
                return ['success' => true];
            } else {
                return ['success' => false, 'error' => $response->body()];
            }
        } catch (\Exception $e) {
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