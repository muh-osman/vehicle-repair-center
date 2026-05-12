<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use App\Models\MojazOrder;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;

use Illuminate\Support\Facades\Notification;


class MojazController extends Controller
{
    // Step 1: Frontend sends lookup_type & lookup_value to → backend to check if sequence num or Vin num exist (Mojaz Inquiry)
    public function inquiry(Request $request)
    {
        try {
            $request->validate([
                'lookup_type' => 'required|in:sequence,vin',
                'lookup_value' => 'required|string'
            ]);

            $lookupType = $request->lookup_type;
            $lookupValue = $request->lookup_value;

            // Validation rules
            if ($lookupType === 'sequence' && strlen($lookupValue) > 10) {
                return response()->json(['message' => 'Sequence max 10 digits'], 422);
            }

            if ($lookupType === 'vin' && strlen($lookupValue) > 17) {
                return response()->json(['message' => 'VIN max 17 chars'], 422);
            }

            $endpoint = $lookupType === 'sequence'
                ? '/inquiry/sequence'
                : '/inquiry/vin';

            $url = config('services.mojaz.base_url') . $endpoint;

            $headers = [
                'Client-key: ' . config('services.mojaz.client_key'),
                'app-id: ' . config('services.mojaz.app_id'),
                'app-key: ' . config('services.mojaz.app_key'),
                'language: AR'
            ];

            $queryParams = [
                $lookupType => $lookupValue
            ];

            // Build and log cURL command
            $curlCommand = $this->buildCurlCommand($url, $headers, $queryParams);
            Log::channel('daily')->info('cURL Command', ['command' => $curlCommand]);

            $response = Http::withHeaders([
                'Client-key' => config('services.mojaz.client_key'),
                'app-id'     => config('services.mojaz.app_id'),
                'app-key'    => config('services.mojaz.app_key'),
                'language'   => 'AR'
            ])->withoutVerifying()->get($url, $queryParams);

            $data = $response->json();

            Log::channel('daily')->info('Mojaz API Response', [
                'lookup_type' => $lookupType,
                'lookup_value' => $lookupValue,
                'body'    => $response->body(),   // <-- THIS is the key addition
                'response_data' => $data
            ]);

            return response()->json([
                'data'    => $data
            ]);
        } catch (\Exception $e) {
            Log::channel('daily')->error('Mojaz Error: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Server error'
            ], 500);
        }
    }

    // For debug
    private function buildCurlCommand($url, $headers, $params = [])
    {
        // Build query string
        $queryString = http_build_query($params);
        $fullUrl = $queryString ? $url . '?' . $queryString : $url;

        // Start building cURL command
        $curl = "curl -X GET '" . $fullUrl . "'";

        // Add headers
        foreach ($headers as $header) {
            $curl .= " \\\n  -H '" . $header . "'";
        }

        // Add useful options
        $curl .= " \\\n  -i";  // Include headers in output
        $curl .= " \\\n  --max-time 30";  // Timeout
        $curl .= " \\\n  --compressed";  // Support compression

        return $curl;
    }


    /**
     * Handle Mojaz payment paid webhook
     */
    public function MojazPaymentPaidWebhook(Request $request)
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
                'payment_id' => $paymentData['id'] ?? null,
                // 'status' => $paymentData['status'] ?? null,
                'lookup_type' => $metadata['lookupType'] ?? null,
                'lookup_value' => $metadata['lookupValue'] ?? null,
                'name' => $metadata['name'] ?? null,
                'phone' => $metadata['phone'] ?? null,
                'user_id' => $metadata['userId'] ?? null,
                'email' => $metadata['email'] ?? null,
                'amount' => $metadata['price'] ?? 0,
            ];

            // Check if payment already exists to avoid duplicates
            $existingPayment = MojazOrder::where('payment_id', $paymentInfo['payment_id'])->first();


            if ($existingPayment) {
                return response()->json([
                    'status' => 'success',
                    'message' => 'Payment already exists in database',
                    'payment_id' => $existingPayment->payment_id,
                    'database_id' => $existingPayment->id,
                    'timestamp' => now()->toDateTimeString()
                ], 200);
            }

            // Store payment data in database
            $payment = MojazOrder::create($paymentInfo);

            // Dispatch job to initiate + poll for PDF
            \App\Jobs\InitiateMojazReport::dispatch($payment);


            // Send email notification to multiple recipients
            // $recipients = ['omar.cashif@gmail.com', 'cashif.acct@gmail.com', 'cashif2020@gmail.com', 'talalmeasar55@gmail.com'];
            // $recipients = ['gp415400@gmail.com']; // For testing

            // try {
            //     Notification::route('mail', $recipients)
            //         ->notify(new ShippingPaymentPaid($paymentInfo));

            //     Log::channel('daily')->info('Mojaz payment email notification sent successfully', [
            //         'payment_id' => $payment->payment_id,
            //         'recipients' => $recipients,
            //         'sent_at' => now()->toDateTimeString()
            //     ]);
            // } catch (\Exception $e) {
            //     // Log email failure but don't stop the process
            //     Log::channel('daily')->error('Mojaz payment email notification failed', [
            //         'error' => $e->getMessage(),
            //         'payment_id' => $payment->payment_id,
            //         'recipients' => $recipients,
            //         'timestamp' => now()->toDateTimeString()
            //     ]);
            // }

            // Log successful storage
            Log::channel('daily')->info('Moyasar Mojaz Payment stored successfully', [
                'payment_id' => $payment->payment_id,
                'user_id' => $payment->user_id,
                'lookup_type' => $payment->lookup_type,
                'lookup_value' => $payment->lookup_value,
                'stored_at' => now()->toDateTimeString()
            ]);

            return response()->json([
                'status' => 'success',
                'message' => 'Payment data stored and notification sent successfully',
                'payment_id' => $payment->payment_id,
                'database_id' => $payment->id,
                // 'email_sent' => true,
                'timestamp' => now()->toDateTimeString()
            ], 200);
        } catch (\Exception $e) {
            // Log the error
            Log::channel('daily')->error('Moyasar Mojaz Payment Webhook Error', [
                'error' => $e->getMessage(),
                'payload' => $request->all(),
                'timestamp' => now()->toDateTimeString()
            ]);

            return response()->json([
                'status' => 'error',
                'message' => 'Mojaz Webhook processing failed',
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

        // Check 1: HMAC signature header (preferred)
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

        // Check 2: Payload secret token — ALWAYS validate if present
        // Additional security: Verify secret token from payload
        // ✅ Reject if missing OR mismatched
        $payloadToken = $request->input('secret_token');
        if (!$payloadToken || !hash_equals($secretToken, $payloadToken)) {
            throw new \Exception('Invalid secret token in payload');
        }

        // Verify event type is payment_paid
        $eventType = $request->input('type');
        if ($eventType !== 'payment_paid') {
            throw new \Exception('Invalid event type: ' . $eventType);
        }
    }



    /**
     * Get all Mojaz orders for a specific user
     */
    public function userOrders(Request $request, $user_id)
    {
        try {
            $orders = MojazOrder::where('user_id', $user_id)
                ->orderBy('created_at', 'desc')
                ->get()
                ->map(function ($order) {
                    $order->pdf_url = $order->pdf_path
                        ? url($order->pdf_path)
                        : null;
                    return $order;
                });

            return response()->json([
                'status' => 'success',
                'total'  => $orders->count(),
                'data'   => $orders
            ]);
        } catch (\Exception $e) {
            Log::channel('daily')->error('Mojaz userOrders Error', [
                'error'     => $e->getMessage(),
                'timestamp' => now()->toDateTimeString()
            ]);

            return response()->json([
                'status'  => 'error',
                'message' => 'Server error'
            ], 500);
        }
    }


    /**
     * Get all Mojaz orders
     */
    public function index(Request $request)
    {
        try {
            $orders = MojazOrder::orderBy('created_at', 'desc')
                ->get()
                ->map(function ($order) {
                    $order->pdf_url = $order->pdf_path
                        ? url($order->pdf_path)
                        : null;
                    return $order;
                });

            return response()->json([
                'status' => 'success',
                'total'  => $orders->count(),
                'data'   => $orders
            ]);
        } catch (\Exception $e) {
            Log::channel('daily')->error('Mojaz index Error', [
                'error'     => $e->getMessage(),
                'timestamp' => now()->toDateTimeString()
            ]);

            return response()->json([
                'status'  => 'error',
                'message' => 'Server error'
            ], 500);
        }
    }
}
