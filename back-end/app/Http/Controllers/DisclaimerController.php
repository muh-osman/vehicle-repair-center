<?php

namespace App\Http\Controllers;

use App\Models\Disclaimer;
use Illuminate\Http\Request;
use Illuminate\Database\QueryException;
use Illuminate\Support\Str;


class DisclaimerController extends Controller
{
    // List all disclaimers
    public function index()
    {
        return response()->json(['disclaimers' => Disclaimer::latest()->get()], 200);
    }


    // Store a new disclaimer
    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'plate_letter1' => 'required|string|max:10',
                'plate_letter2' => 'required|string|max:10',
                'plate_letter3' => 'required|string|max:10',
                'plate_number'  => 'required|string|max:20',
                'car_type'      => 'required|string|max:255',
                'report_number' => 'required|string|max:255|unique:disclaimers',
                'name'          => 'required|string|max:255',
                'signature'     => 'required|image|mimes:jpeg,png,jpg,gif|max:2048',
            ]);

            // Handle signature upload
            $file = $request->file('signature');
            $filename = Str::uuid() . '.' . $file->getClientOriginalExtension();
            $file->move(public_path('signatures'), $filename);

            // Create disclaimer with signature filename
            $disclaimer = Disclaimer::create([
                'plate_letter1' => $validated['plate_letter1'],
                'plate_letter2' => $validated['plate_letter2'],
                'plate_letter3' => $validated['plate_letter3'],
                'plate_number' => $validated['plate_number'],
                'car_type'     => $validated['car_type'],
                'report_number' => $validated['report_number'],
                'name'         => $validated['name'],
                'signature'    => $filename
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Disclaimer created successfully',
                'data' => [
                    'disclaimer' => $disclaimer,
                    'signature_url' => asset('signatures/' . $filename)
                ]
            ], 201);
        } catch (QueryException $e) {
            return response()->json(['message' => 'Database error: ' . $e->getMessage()], 500);
        } catch (\Exception $e) {
            return response()->json(['message' => 'An error occurred: ' . $e->getMessage()], 500);
        }
    }

    // Show a specific disclaimer
    public function show($id)
    {
        $disclaimer = Disclaimer::find($id);

        if (!$disclaimer) {
            return response()->json(['message' => 'Disclaimer not found'], 404);
        }

        // Get the signature file path
        $signaturePath = public_path('signatures/' . $disclaimer->signature);

        // Check if file exists
        if (file_exists($signaturePath)) {
            // Get the file mime type
            $mimeType = mime_content_type($signaturePath);

            // Read the file and convert to base64
            $signatureData = file_get_contents($signaturePath);
            $base64Signature = 'data:' . $mimeType . ';base64,' . base64_encode($signatureData);

            // Create a copy of the disclaimer data to avoid modifying the original
            $disclaimerData = $disclaimer->toArray();
            $disclaimerData['signature_base64'] = $base64Signature;

            return response()->json(['disclaimer' => $disclaimerData], 200);
        }

        return response()->json(['disclaimer' => $disclaimer], 200);
    }

    // Delete a specific disclaimer
    public function destroy($id)
    {
        $disclaimer = Disclaimer::findOrFail($id);

        // Delete the associated signature image
        if ($disclaimer->signature && file_exists(public_path('signatures/' . $disclaimer->signature))) {
            unlink(public_path('signatures/' . $disclaimer->signature));
        }

        $disclaimer->delete();

        return response()->json(['success' => true]);
    }
}
