<?php

namespace App\Http\Controllers;

use App\Models\LotteryEntry;
use Illuminate\Http\Request;

use Illuminate\Support\Facades\DB;
use Carbon\Carbon;


class LotteryEntryController extends Controller
{
    /**
     * Store a new lottery entry
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'  => 'required|string|max:255',
            'phone' => 'required|string|max:20|unique:lottery_entries,phone',
            'query_params' => 'nullable|string'
        ]);

        $entry = LotteryEntry::create([
            'name'              => $validated['name'],
            'phone'             => $validated['phone'],
            'discount_percent'  => 20, // fixed 20%
            'is_discount_used' => false,
            'query_params'      => $validated['query_params'] ?? null
        ]);

        return response()->json([
            'message' => 'Lottery entry created successfully',
            'data' => $entry
        ], 201);
    }

    /**
     * List all entries (admin)
     */
    public function index()
    {
        return LotteryEntry::orderBy('created_at', 'desc')->get();
    }

    // /**
    //  * Mark discount as used
    //  */
    // public function markUsed($id)
    // {
    //     $entry = LotteryEntry::findOrFail($id);
    //     $entry->is_discount_used = true;
    //     $entry->save();

    //     return response()->json([
    //         'message' => 'Discount marked as used',
    //         'data' => $entry
    //     ]);
    // }


    public function show($phone)
    {
        return DB::transaction(function () use ($phone) {

            // Lock row to prevent double-use race condition
            $entry = LotteryEntry::where('phone', $phone)
                ->lockForUpdate()
                ->first();

            // Check if phone exists
            if (!$entry) {
                return response()->json([
                    'data' => null,
                    'status' => "not_found",
                    'message' => 'QR Code not found'
                ]);
            }

            // Expiration date (20 March 2026)
            $expiryDate = Carbon::create(2026, 3, 20);

            if (Carbon::now()->greaterThan($expiryDate)) {
                return response()->json([
                    'data' => $entry,
                    'status' => "expired",
                    'message' => 'This QR code has expired',
                    'discount_percent' => $entry->discount_percent
                ]);
            }

            // Already used
            if ($entry->is_discount_used) {
                return response()->json([
                    'data' => $entry,
                    'status' => "used_before",
                    'message' => 'This QR code was used before',
                    'discount_percent' => $entry->discount_percent
                ]);
            }

            // Mark as used
            $entry->update(['is_discount_used' => true]);
            $entry->refresh();

            return response()->json([
                'data' => $entry,
                'status' => "success",
                'message' => 'QR code successfully redeemed',
                'discount_percent' => $entry->discount_percent
            ]);
        });
    }


    public function checkValid($phone)
    {
        $entry = LotteryEntry::where('phone', $phone)->first();

        // Not found
        if (!$entry) {
            return response()->json([
                'valid' => false,
                'status' => 'not_found',
                'message' => 'الرقم غير مسجل'
            ], 404);
        }

        // Already used
        if ($entry->is_discount_used) {
            return response()->json([
                'valid' => false,
                'status' => 'used',
                'message' => 'تم استخدام كود الخصم سابقا'
            ], 404);
        }

        // Valid and unused
        return response()->json([
            'valid' => true,
            'status' => 'available',
            'message' => 'Discount is valid and unused',
            'discount_percent' => $entry->discount_percent,
            'data' => $entry
        ]);
    }
}
