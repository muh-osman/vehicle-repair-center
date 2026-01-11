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
    // public function store(Request $request)
    // {

    //     // Validate the incoming request data
    //     $validatedData = $request->validate([
    //         'paid_qr_code' => 'required|string|unique:paid_qr_codes,paid_qr_code',
    //         'full_name' => 'nullable|string|max:255',
    //         'phone' => 'nullable|string|max:20',
    //         'branch' => 'nullable|string|max:255',
    //         'plan' => 'nullable|string|max:255',
    //         'price' => 'nullable|numeric|min:0', // Ensure price is a number and >= 0
    //         'model' => 'nullable|string|max:255',
    //         'year' => 'nullable|string|max:255',
    //         'additionalServices' => 'nullable|string|max:255',
    //         'service' => 'nullable|string|max:255',
    //         'affiliate' => 'nullable|string|max:255',
    //         'discountCode' => 'nullable|string|max:255',
    //         'marketerShare' => 'nullable|numeric|min:0',
    //         'full_year' => 'nullable|string|max:255',

    //         'clientId' => 'nullable|string|max:255',
    //         'redeemeAmoumntValue' => 'nullable|numeric|min:0',

    //         // 'isShipped' => 'nullable|boolean', no need herer
    //         'address' => 'nullable|string|max:1000',
    //     ]);

    //     // Secret Key
    //     $apiKey = env('PAYMENT_GETWAY_SECRET_LIVE_KEY');

    //     $response = Http::withBasicAuth($apiKey, '')
    //         ->get("https://api.moyasar.com/v1/payments/{$validatedData['paid_qr_code']}");

    //     if ($response->successful()) {
    //         $responseData = $response->json();
    //         $metadata = $responseData['metadata'] ?? [];

    //         // Check if the QR code already exists
    //         $qrCode = PaidQrCode::where('paid_qr_code', $validatedData['paid_qr_code'])->first();

    //         if (!$qrCode) {
    //             // Create a new PaidQrCode entry
    //             $qrCode = PaidQrCode::create([
    //                 'paid_qr_code' => $validatedData['paid_qr_code'],
    //                 'full_name' => $metadata['name'] ?? null,
    //                 'phone' => $metadata['phone'] ?? null,
    //                 'branch' => $metadata['branch'] ?? null,
    //                 'plan' => $metadata['plan'] ?? null,
    //                 'price' => $metadata['price'] ?? 0, // Default to 0 if not present
    //                 'model' => $metadata['model'] ?? null,
    //                 'year' => $metadata['year'] ?? null,
    //                 'additionalServices' => $metadata['additionalServices'] ?? null,
    //                 'service' => $metadata['service'] ?? null,
    //                 'affiliate' => $metadata['affiliate'] ?? null,
    //                 'discountCode' => $metadata['dc'] ?? null,
    //                 'marketerShare' => $metadata['msh'] ?? null,
    //                 'full_year' => $metadata['fy'] ?? null,
    //                 'clientId' => $metadata['cd'] ?? null,
    //                 'redeemeAmoumntValue' => $metadata['rv'] ?? 0,
    //                 'date_of_visited' => null, // Set date_of_visited to null
    //                 'address' => $metadata['ad'] ?? null,
    //             ]);


    //             // Make API request if redeemeAmoumntValue > 0
    //             if ($qrCode->redeemeAmoumntValue > 0 && !empty($qrCode->clientId)) {
    //                 try {
    //                     $data = [
    //                         'clientId' => (int) $qrCode->clientId,
    //                         'points' => (int) $qrCode->redeemeAmoumntValue
    //                     ];

    //                     $apiResponse = Http::withHeaders([
    //                         'Content-Type' => 'application/json-patch+json',
    //                     ])->put('https://cashif-001-site1.dtempurl.com/api/Clients/UpdateClientPointDto', $data);

    //                     if ($apiResponse->successful()) {
    //                         Log::info('Client points update API request successful', [
    //                             'clientId' => $qrCode->clientId,
    //                             'points' => $qrCode->redeemeAmoumntValue,
    //                             'response' => $apiResponse->json(),
    //                         ]);
    //                     } else {
    //                         Log::error('Client points update API request failed', [
    //                             'clientId' => $qrCode->clientId,
    //                             'points' => $qrCode->redeemeAmoumntValue,
    //                             'status' => $apiResponse->status(),
    //                             'response' => $apiResponse->json(),
    //                         ]);
    //                     }
    //                 } catch (\Exception $e) {
    //                     Log::error('Error occurred while making client points update API request', [
    //                         'clientId' => $qrCode->clientId,
    //                         'points' => $qrCode->redeemeAmoumntValue,
    //                         'message' => $e->getMessage(),
    //                     ]);
    //                 }
    //             }


    //             // Send notification to multiple recipients
    //             $recipients = ['omar.cashif@gmail.com', 'cashif.acct@gmail.com', 'cashif2020@gmail.com', 'talalmeasar55@gmail.com'];
    //             // $recipients = ['song415400@gmail.com',]; // Replace with actual email addresses

    //             $paymentMethod = "Moyasar";

    //             // Prepare the data to pass to the notification
    //             $notificationData = array_merge($qrCode->toArray(), [
    //                 'service' => $metadata['service'] ?? null,
    //                 'payment_method' => $paymentMethod,
    //                 'additionalServices' => $metadata['additionalServices'] ?? null,
    //                 'branch' => $metadata['branch'] ?? null,
    //                 'plan' => $metadata['plan'] ?? null,
    //                 'model' => $metadata['model'] ?? null,
    //                 'full_name' => $metadata['name'] ?? null, // Use name from metadata
    //                 'phone' => $metadata['phone'] ?? null, // Use phone from metadata
    //                 'discountCode' => $metadata['dc'] ?? null, // Use from metadata
    //                 'address' => $metadata['ad'] ?? null, // Use from metadata
    //                 'full_year' => $metadata['fy'] ?? null,
    //             ]);

    //             try {
    //                 Notification::route('mail', $recipients)
    //                     ->notify(new QrCodeStored($notificationData));
    //             } catch (\Exception $e) {
    //                 // Log the error or handle it as needed
    //                 Log::error('Email notification failed: ' . $e->getMessage());
    //                 // You can also choose to notify the user about the failure if needed
    //             }

    //             return response()->json([
    //                 'message' => 'QR code stored successfully',
    //                 'exists' => false,
    //                 'data' => $qrCode
    //             ], 201); // Return 201 Created status
    //         } else {
    //             // If it exists, return a message indicating so along with the created_at date
    //             return response()->json([
    //                 'message' => 'QR code already exists',
    //                 'exists' => true,
    //                 'created_at' => $qrCode->created_at,
    //                 'data' => $qrCode
    //             ]);
    //         }
    //     } else {
    //         return response()->json(['error' => 'Payment not found'], 404);
    //     }
    // }


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


    /**
     * Handle Moyasar payment paid webhook
     */
    public function  purchaseCheckMoyasarWebhook(Request $request)
    {
        try {
            // Verify the webhook signature
            $this->verifyWebhookSignature($request);

            // Get the webhook payload
            $webhookData = $request->all();

            // Extract data from webhook payload
            $paymentData = $webhookData['data'] ?? [];
            $metadata = $paymentData['metadata'] ?? [];

            // Prepare data for storage and notification
            $paymentInfo = [
                'paid_qr_code' => $paymentData['id'],
                'full_name' => $metadata['name'] ?? null,
                'phone' => $metadata['phone'] ?? null,
                'branch' => $metadata['branch'] ?? null,
                'plan' => $metadata['plan'] ?? null,
                'price' => $metadata['price'] ?? 0,
                'model' => $metadata['model'] ?? null,
                'year' => $metadata['year'] ?? null,
                'additionalServices' => $metadata['additionalServices'] ?? null,
                'service' => $metadata['service'] ?? null,
                'affiliate' => $metadata['affiliate'] ?? null,
                'discountCode' => $metadata['dc'] ?? null,
                'marketerShare' => $metadata['msh'] ?? null,
                'full_year' => $metadata['fy'] ?? null,
                'clientId' => $metadata['cd'] ?? null,
                'redeemeAmoumntValue' => $metadata['rv'] ?? 0,
                'date_of_visited' => null,
                'address' => $metadata['ad'] ?? null,
            ];

            // Check if payment already exists to avoid duplicates
            $existingPayment = PaidQrCode::where('paid_qr_code', $paymentInfo['paid_qr_code'])->first();


            if ($existingPayment) {
                return response()->json([
                    'status' => 'success',
                    'message' => 'Payment already exists in database',
                    'paid_qr_code' => $existingPayment->paid_qr_code,
                    'database_id' => $existingPayment->id,
                    'timestamp' => now()->toDateTimeString()
                ], 200);
            }

            // Store payment data in database
            $payment = PaidQrCode::create($paymentInfo);


            // Make API request if redeemeAmoumntValue > 0 point (هذا api يخصم النقاط من حساب العميل في حال استخدامها)
            if ($payment->redeemeAmoumntValue > 0 && !empty($payment->clientId)) {
                try {
                    $data = [
                        'clientId' => (int) $payment->clientId,
                        'points' => (int) $payment->redeemeAmoumntValue
                    ];

                    $apiResponse = Http::withHeaders([
                        'Content-Type' => 'application/json-patch+json',
                    ])->put('https://cashif-001-site1.dtempurl.com/api/Clients/UpdateClientPointDto', $data);

                    if ($apiResponse->successful()) {
                        Log::info('Client points update API request successful', [
                            'clientId' => $payment->clientId,
                            'points' => $payment->redeemeAmoumntValue,
                            'response' => $apiResponse->json(),
                        ]);
                    } else {
                        Log::error('Client points update API request failed', [
                            'clientId' => $payment->clientId,
                            'points' => $payment->redeemeAmoumntValue,
                            'status' => $apiResponse->status(),
                            'response' => $apiResponse->json(),
                        ]);
                    }
                } catch (\Exception $e) {
                    Log::error('Error occurred while making client points update API request', [
                        'clientId' => $payment->clientId,
                        'points' => $payment->redeemeAmoumntValue,
                        'message' => $e->getMessage(),
                    ]);
                }
            }


            // Send email notification to multiple recipients
            $recipients = ['omar.cashif@gmail.com', 'cashif.acct@gmail.com', 'cashif2020@gmail.com', 'talalmeasar55@gmail.com'];
            // $recipients = ['gp415400@gmail.com']; // For testing

            $paymentMethod = "Moyasar";
            // Prepare the data to pass to the notification
            $notificationData = array_merge($payment->toArray(), [
                // 'service' => $metadata['service'] ?? null,
                'payment_method' => $paymentMethod,
                // 'additionalServices' => $metadata['additionalServices'] ?? null,
                // 'branch' => $metadata['branch'] ?? null,
                // 'plan' => $metadata['plan'] ?? null,
                // 'model' => $metadata['model'] ?? null,
                // 'full_name' => $metadata['name'] ?? null, // Use name from metadata
                // 'phone' => $metadata['phone'] ?? null, // Use phone from metadata
                // 'discountCode' => $metadata['dc'] ?? null, // Use from metadata
                // 'address' => $metadata['ad'] ?? null, // Use from metadata
                // 'full_year' => $metadata['fy'] ?? null,
            ]);

            try {

                Log::channel('daily')->info('Notification Data Prepared', [
                    'notification_data' => $notificationData,
                    'paid_qr_code' => $payment->paid_qr_code,
                ]);

                Notification::route('mail', $recipients)
                    ->notify(new QrCodeStored($notificationData));

                Log::channel('daily')->info('Payment email notification sent successfully', [
                    'paid_qr_code' => $payment->paid_qr_code,
                    'recipients' => $recipients,
                    'sent_at' => now()->toDateTimeString()
                ]);
            } catch (\Exception $e) {
                // Log email failure but don't stop the process
                Log::channel('daily')->error('Payment email notification failed', [
                    'error' => $e->getMessage(),
                    'paid_qr_code' => $payment->paid_qr_code,
                    'recipients' => $recipients,
                    'timestamp' => now()->toDateTimeString()
                ]);
            }

            // Log successful storage
            Log::channel('daily')->info('Moyasar Payment stored successfully', [
                'paid_qr_code' => $payment->paid_qr_code,
                'stored_at' => now()->toDateTimeString()
            ]);

            return response()->json([
                'status' => 'success',
                'message' => 'Payment data stored and notification sent successfully',
                'paid_qr_code' => $payment->paid_qr_code,
                'database_id' => $payment->id,
                'email_sent' => true,
                'timestamp' => now()->toDateTimeString()
            ], 200);
        } catch (\Exception $e) {
            // Log the error
            Log::channel('daily')->error('Moyasar Payment Webhook Error', [
                'error' => $e->getMessage(),
                'payload' => $request->all(),
                'timestamp' => now()->toDateTimeString()
            ]);

            return response()->json([
                'status' => 'error',
                'message' => 'Webhook processing failed',
                'error' => $e->getMessage()
            ], 400);
        }
    }

    /**
     * Verify webhook signature for security
     */
    private function verifyWebhookSignature(Request $request)
    {
        $secretToken = env('MOYASAR_SECRET_TOKEN');

        if (!$secretToken) {
            throw new \Exception('Moyasar secret token not configured');
        }

        // Moyasar might send a signature header, verify it here
        $signature = $request->header('X-Moyasar-Signature') ?? $request->header('Moyasar-Signature');

        if ($signature) {
            // Verify the signature using your secret token
            $payload = $request->getContent();
            $expectedSignature = hash_hmac('sha256', $payload, $secretToken);

            if (!hash_equals($expectedSignature, $signature)) {
                throw new \Exception('Invalid webhook signature');
            }
        }

        // Additional security: Verify secret token from payload
        $payloadToken = $request->input('secret_token');
        if ($payloadToken && $payloadToken !== $secretToken) {
            throw new \Exception('Invalid secret token in payload');
        }

        // Verify event type is payment_paid
        $eventType = $request->input('type');
        if ($eventType !== 'payment_paid') {
            throw new \Exception('Invalid event type: ' . $eventType);
        }
    }
}
