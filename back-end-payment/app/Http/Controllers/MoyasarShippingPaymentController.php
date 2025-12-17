<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use App\Models\MoyasarShippingPayment;
use Illuminate\Support\Facades\Http;

use Illuminate\Support\Facades\Notification;
use App\Notifications\ShippingPaymentPaid;

class MoyasarShippingPaymentController extends Controller
{

    /**
     * Get all shipping payments
     */
    public function getAllShippingPayments(Request $request)
    {
        try {
            // Get all payments from database ordered by newest first
            $payments = MoyasarShippingPayment::orderBy('created_at', 'desc')->get();

            // Return JSON response with all payments
            return response()->json([
                'status' => 'success',
                'message' => 'Shipping payments retrieved successfully',
                'count' => $payments->count(),
                'data' => $payments
            ], 200);
        } catch (\Exception $e) {
            // Log the error
            Log::channel('daily')->error('Failed to retrieve shipping payments', [
                'error' => $e->getMessage(),
                'timestamp' => now()->toDateTimeString()
            ]);

            return response()->json([
                'status' => 'error',
                'message' => 'Failed to retrieve shipping payments',
                'error' => $e->getMessage()
            ], 500);
        }
    }


    /**
     * Handle shipping payment paid webhook
     */
    public function ShippingPaymentPaidWebhook(Request $request)
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
                'name' => $metadata['name'] ?? null,
                'reportNumber' => $metadata['reportNumber'] ?? null,
                'model' => $metadata['model'] ?? null,
                'modelCategory' => $metadata['modelCategory'] ?? null,
                'plateNumber' => $metadata['plateNumber'] ?? null,
                'from' => $metadata['from'] ?? null,
                'to' => $metadata['to'] ?? null,
                'shippingType' => $metadata['shippingType'] ?? null,
                'price' => $metadata['price'] ?? 0,
                'phoneNumber' => $metadata['phoneNumber'] ?? null,
                'status' => $paymentData['status'] ?? null,
                'isShipped' => false, // Default to false for new payments
                'accountant_status' => false, // Default to false for new payments
            ];

            // Check if payment already exists to avoid duplicates
            $existingPayment = MoyasarShippingPayment::where('payment_id', $paymentInfo['payment_id'])->first();


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
            $payment = MoyasarShippingPayment::create($paymentInfo);

            // Send email notification to multiple recipients
            $recipients = ['omar.cashif@gmail.com', 'cashif.acct@gmail.com', 'cashif2020@gmail.com', 'talalmeasar55@gmail.com'];
            // $recipients = ['gp415400@gmail.com']; // For testing

            try {
                Notification::route('mail', $recipients)
                    ->notify(new ShippingPaymentPaid($paymentInfo));

                Log::channel('daily')->info('Shipping payment email notification sent successfully', [
                    'payment_id' => $payment->payment_id,
                    'recipients' => $recipients,
                    'sent_at' => now()->toDateTimeString()
                ]);
            } catch (\Exception $e) {
                // Log email failure but don't stop the process
                Log::channel('daily')->error('Shipping payment email notification failed', [
                    'error' => $e->getMessage(),
                    'payment_id' => $payment->payment_id,
                    'recipients' => $recipients,
                    'timestamp' => now()->toDateTimeString()
                ]);
            }

            // Log successful storage
            Log::channel('daily')->info('Moyasar Shipping Payment stored successfully', [
                'payment_id' => $payment->payment_id,
                'report_number' => $payment->reportNumber,
                'stored_at' => now()->toDateTimeString()
            ]);

            return response()->json([
                'status' => 'success',
                'message' => 'Payment data stored and notification sent successfully',
                'payment_id' => $payment->payment_id,
                'database_id' => $payment->id,
                'email_sent' => true,
                'timestamp' => now()->toDateTimeString()
            ], 200);
        } catch (\Exception $e) {
            // Log the error
            Log::channel('daily')->error('Moyasar Shipping Payment Webhook Error', [
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




    /**
     * Display the specified payment by ID
     */
    public function show($id)
    {
        // Validate the ID
        if (empty($id) || !is_string($id)) {
            return response()->json(['error' => 'Invalid ID provided'], 400);
        }

        // Check if exists in the database
        $paymentIdExist = MoyasarShippingPayment::where('payment_id', $id)->first();

        if (!$paymentIdExist) {
            return response()->json(['error' => 'Not found in the database'], 404);
        }

        // Secret Key
        $apiKey = env('PAYMENT_GETWAY_SECRET_LIVE_KEY_FOR_SHIPPING_GETWAY');

        // Validate API key
        if (empty($apiKey)) {
            Log::channel('daily')->error('Moyasar API key not configured', [
                'payment_id' => $id,
                'timestamp' => now()->toDateTimeString()
            ]);

            return response()->json([
                'error' => 'Payment gateway configuration error'
            ], 500);
        }

        try {
            $response = Http::withBasicAuth($apiKey, '')
                ->timeout(30)
                ->retry(3, 100)
                ->get("https://api.moyasar.com/v1/payments/{$id}");

            if ($response->successful()) {
                $responseData = $response->json();

                // Log successful retrieval
                Log::channel('daily')->info('Payment data retrieved successfully from Moyasar', [
                    'payment_id' => $id,
                    'status' => $responseData['status'] ?? 'unknown',
                    'retrieved_at' => now()->toDateTimeString()
                ]);

                return response()->json($responseData);
            } elseif ($response->status() == 404) {
                Log::channel('daily')->warning('Payment not found in Moyasar API', [
                    'payment_id' => $id,
                    'timestamp' => now()->toDateTimeString()
                ]);

                return response()->json(['error' => 'Payment not found in payment gateway'], 404);
            } else {
                $errorMessage = 'An error occurred while retrieving payment data from payment gateway';
                $statusCode = $response->status();

                Log::channel('daily')->error('Moyasar API error response', [
                    'payment_id' => $id,
                    'status_code' => $statusCode,
                    'response_body' => $response->body(),
                    'timestamp' => now()->toDateTimeString()
                ]);

                return response()->json(['error' => $errorMessage], $statusCode);
            }
        } catch (\Exception $e) {
            Log::channel('daily')->error('Unexpected error retrieving payment data', [
                'payment_id' => $id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'timestamp' => now()->toDateTimeString()
            ]);

            return response()->json([
                'error' => 'An unexpected error occurred: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update shipping status to shipped
     */
    public function markAsShipped($id)
    {
        try {
            // Validate ID
            if (empty($id) || !is_numeric($id)) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Invalid ID provided'
                ], 400);
            }

            // Find the payment by database ID
            $payment = MoyasarShippingPayment::find($id);

            if (!$payment) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Payment not found'
                ], 404);
            }

            // Get the current shipping status
            $currentStatus = $payment->isShipped;

            // Toggle the shipping status
            $newStatus = !$currentStatus;

            // Update the shipping status
            $payment->update([
                'isShipped' => $newStatus,
            ]);

            // Determine action for logging
            $action = $newStatus ? 'shipped' : 'not shipped';

            // Log the update
            Log::channel('daily')->info('Payment shipping status updated', [
                'payment_id' => $payment->payment_id,
                'database_id' => $payment->id,
                'previous_status' => $currentStatus,
                'new_status' => $newStatus,
                'updated_at' => now()->toDateTimeString(),
                'report_number' => $payment->reportNumber
            ]);

            return response()->json([
                'status' => 'success',
                'message' => 'Payment marked as ' . $action . ' successfully',
                'data' => $payment->fresh(),
                'isShipped' => $newStatus
            ], 200);
        } catch (\Exception $e) {
            Log::channel('daily')->error('Failed to update payment shipping status', [
                'id' => $id,
                'error' => $e->getMessage(),
                'timestamp' => now()->toDateTimeString()
            ]);

            return response()->json([
                'status' => 'error',
                'message' => 'Failed to update shipping status',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update accountant status to accounted
     */
    public function markAsAccounted($id)
    {
        try {
            // Validate ID
            if (empty($id) || !is_numeric($id)) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Invalid ID provided'
                ], 400);
            }

            // Find the payment by database ID
            $payment = MoyasarShippingPayment::find($id);

            if (!$payment) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Payment not found'
                ], 404);
            }

            // Get the current accountant status
            $currentStatus = $payment->accountant_status;

            // Toggle the accountant status
            $newStatus = !$currentStatus;

            // Update the accountant status
            $payment->update([
                'accountant_status' => $newStatus,
            ]);

            // Determine action for logging
            $action = $newStatus ? 'accounted' : 'not accounted';

            // Log the update
            Log::channel('daily')->info('Payment accountant status updated', [
                'payment_id' => $payment->payment_id,
                'database_id' => $payment->id,
                'previous_status' => $currentStatus,
                'new_status' => $newStatus,
                'updated_at' => now()->toDateTimeString(),
                'report_number' => $payment->reportNumber
            ]);

            return response()->json([
                'status' => 'success',
                'message' => 'Payment marked as ' . $action . ' successfully',
                'data' => $payment->fresh(),
                'accountant_status' => $newStatus
            ], 200);
        } catch (\Exception $e) {
            Log::channel('daily')->error('Failed to update payment accountant status', [
                'id' => $id,
                'error' => $e->getMessage(),
                'timestamp' => now()->toDateTimeString()
            ]);

            return response()->json([
                'status' => 'error',
                'message' => 'Failed to update accountant status',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
