<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use App\Models\MoyasarShippingPayment;

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
}
