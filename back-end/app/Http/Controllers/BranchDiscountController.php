<?php

namespace App\Http\Controllers;

use App\Models\BranchDiscount;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;

class BranchDiscountController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $branchDiscounts = BranchDiscount::latest()->get();
        return response()->json($branchDiscounts);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'branch_name'      => 'required|string|unique:branch_discounts,branch_name|max:255',
            'discount_percent' => 'required|numeric|min:0|max:100',
            'valid_until'      => 'required|date|after_or_equal:today',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'errors' => $validator->errors()
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        $branchDiscount = BranchDiscount::create([
            'branch_name'      => $request->branch_name,
            'discount_percent' => $request->discount_percent,
            'scan_count'       => 0,
            'valid_until'      => $request->valid_until,
        ]);

        return response()->json($branchDiscount, Response::HTTP_CREATED);
    }

    /**
     * Display the specified resource by branch name and increment scan count.
     */
    public function show($branch_name)
    {
        return DB::transaction(function () use ($branch_name) {
            $branchDiscount = BranchDiscount::where('branch_name', $branch_name)
                ->lockForUpdate()
                ->first();

            // Check if branch exists
            if (!$branchDiscount) {
                return response()->json([
                    'data'    => null,
                    'status'  => 'not found',
                    'message' => 'QR Code not found',
                ]);
            }

            // Check if discount is expired based on valid_until date
            if (now()->isAfter($branchDiscount->valid_until)) {
                return response()->json([
                    'data'             => $branchDiscount,
                    'status'           => 'expired',
                    'message'          => 'This discount has expired',
                    'discount_percent' => $branchDiscount->discount_percent,
                ]);
            }

            // Increment scan count on every valid scan
            $branchDiscount->increment('scan_count');
            $branchDiscount->refresh();

            return response()->json([
                'data'             => $branchDiscount,
                'status'           => 'success',
                'message'          => 'QR code successfully scanned',
                'discount_percent' => $branchDiscount->discount_percent,
            ]);
        });
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        $branchDiscount = BranchDiscount::find($id);

        if (!$branchDiscount) {
            return response()->json([
                'message' => 'Branch discount not found'
            ], Response::HTTP_NOT_FOUND);
        }

        $branchDiscount->delete();

        return response()->json(null, Response::HTTP_NO_CONTENT);
    }
}
