<?php

namespace App\Http\Controllers;

use App\Models\FreeOrder;
use Illuminate\Http\Request;

use Illuminate\Http\Response;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;


class FreeOrderController extends Controller
{

    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $freeOrders = FreeOrder::latest()->get();
        return response()->json($freeOrders);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'phone_number' => 'required|string|unique:free_orders,phone_number|max:20',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'errors' => $validator->errors()
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        $freeOrder = FreeOrder::create([
            'phone_number' => $request->phone_number,
            'is_scanned' => false,
        ]);

        return response()->json($freeOrder, Response::HTTP_CREATED);
    }

    /**
     * Display the specified resource by phone number and mark as scanned.
     */
    public function show($phone_number)
    {
        // Use transaction to ensure atomic operation
        return DB::transaction(function () use ($phone_number) {
            $freeOrder = FreeOrder::where('phone_number', $phone_number)->lockForUpdate()->first();

            // Check if phone_number exist
            if (!$freeOrder) {
                return response()->json([
                    'data' => null,
                    'status' => "not found",
                    'message' => 'QR Code not found'
                ]);
            }

            // Check if QR code is expired (30 days after creation)
            if ($freeOrder->created_at->diffInDays(now()) > 30) {
                return response()->json([
                    'data' => $freeOrder,
                    'status' => "expired",
                    'message' => 'This QR code has expired'
                ]);
            }

            // Check if QR code was already scanned
            if ($freeOrder->is_scanned) {
                return response()->json([
                    'data' => $freeOrder,
                    'status' => "scanned before",
                    'message' => 'This QR code was scanned before'
                ]);
            }

            // Update is_scanned only if it's currently false
            if (!$freeOrder->is_scanned) {
                $freeOrder->update(['is_scanned' => true]);
                $freeOrder->refresh(); // Refresh to get the updated model
            }

            return response()->json([
                'data' => $freeOrder,
                'status' => "success",
                'message' => 'QR code successfully scanned'
            ]);
        });
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        $freeOrder = FreeOrder::find($id);

        if (!$freeOrder) {
            return response()->json([
                'message' => 'Free order not found'
            ], Response::HTTP_NOT_FOUND);
        }

        $freeOrder->delete();

        return response()->json(null, Response::HTTP_NO_CONTENT);
    }
}
