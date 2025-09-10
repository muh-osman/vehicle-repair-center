<?php

namespace App\Http\Controllers;

use App\Models\RefundCline;
use Illuminate\Http\Request;
use Illuminate\Database\QueryException;
use Illuminate\Support\Str;

use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;

class RefundClineController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return response()->json(['refundClients' => RefundCline::latest()->get()], 200);
    }

    // Store a new Refund Client
    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'report_number' => 'required|string|unique:refund_clines,report_number',
                'amount' => 'required|numeric|min:0',
                'inspection_date' => 'required|date',
                'url' => 'required|string|url',
                'random_number' => 'required|string',
            ]);

            // Create Refund Client
            $refund = RefundCline::create([
                'report_number' => $validated['report_number'],
                'amount' => $validated['amount'],
                'inspection_date' => $validated['inspection_date'],
                'url' => $validated['url'],
                'random_number' => $validated['random_number'],
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Refund form created successfully',
                'data' => [
                    'refund' => $refund,
                ]
            ], 201);
        } catch (QueryException $e) {
            return response()->json(['message' => 'Database error: ' . $e->getMessage()], 500);
        } catch (\Exception $e) {
            return response()->json(['message' => 'An error occurred: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        $oneClient = RefundCline::find($id);

        if (!$oneClient) {
            return response()->json(['message' => 'Client not found'], 404);
        }

        // Get the signature file path
        $signaturePath = public_path('refund-clients-signature/' . $oneClient->signature);

        // Check if file exists
        if (file_exists($signaturePath)) {
            // Get the file mime type
            $mimeType = mime_content_type($signaturePath);

            // Read the file and convert to base64
            $signatureData = file_get_contents($signaturePath);
            $base64Signature = 'data:' . $mimeType . ';base64,' . base64_encode($signatureData);

            // Create a copy of the refund client data to avoid modifying the original
            $refundClientData = $oneClient->toArray();
            $refundClientData['signature_base64'] = $base64Signature;

            return response()->json(['client' => $refundClientData], 200);
        }

        return response()->json(['client' => $oneClient], 200);
    }

    /**
     * Display the specified resource by random_number.
     */
    public function showByRand($rand)
    {
        // Find the client by random_number instead of id
        $oneClient = RefundCline::where('random_number', $rand)->first();

        if (!$oneClient) {
            return response()->json(['message' => 'Client not found'], 404);
        }

        return response()->json(['client' => $oneClient], 200);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        try {
            $refundCline = RefundCline::find($id);

            if (!$refundCline) {
                return response()->json(['message' => 'Client not found'], 404);
            }

            // Check if any required field already has a value and reject the update
            $requiredFields = [
                'name',
                'id_number',
                'phone_number',
                'bank_name',
                'iban',
                'signature_date',
                'signature'
            ];

            $nonNullFields = [];
            foreach ($requiredFields as $field) {
                if (!empty($refundCline->$field)) {
                    $nonNullFields[] = $field;
                }
            }

            // If ANY field already has a value, reject the entire update
            if (!empty($nonNullFields)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Update rejected',
                    'errors' => [
                        'non_null_fields' => $nonNullFields,
                        'message' => 'Cannot update client because the following fields already have values: ' . implode(', ', $nonNullFields)
                    ]
                ], 422);
            }

            $validator = Validator::make($request->all(), [
                'name' => 'required|string|max:255',
                'id_number' => 'required|string|max:50',
                'phone_number' => 'required|string|max:20',
                'bank_name' => 'required|string|max:100',
                'iban' => 'required|string|max:34',
                'signature_date' => 'required|date',
                'signature' => 'required|image|mimes:jpeg,png,jpg,gif|max:2048'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation error',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Handle signature upload
            $file = $request->file('signature');
            $filename = Str::uuid() . '.' . $file->getClientOriginalExtension();
            $file->move(public_path('refund-clients-signature'), $filename);

            // Update the client with all required fields
            $refundCline->update([
                'name' => $request->name,
                'id_number' => $request->id_number,
                'phone_number' => $request->phone_number,
                'bank_name' => $request->bank_name,
                'iban' => $request->iban,
                'signature_date' => $request->signature_date,
                'signature' => $filename
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Client updated successfully',
                'data' => [
                    'refund_cline' => $refundCline,
                    'signature_url' => asset('refund-clients-signature/' . $filename)
                ]
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update client',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified Refund Client
     */
    public function destroy($id): JsonResponse
    {
        try {
            $refundCline = RefundCline::findOrFail($id);

            // Delete the associated signature image
            if ($refundCline->signature && file_exists(public_path('refund-clients-signature/' . $refundCline->signature))) {
                unlink(public_path('refund-clients-signature/' . $refundCline->signature));
            }

            $refundCline->delete();

            return response()->json(['success' => true]);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Refund cline not found.'
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete refund cline.',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
