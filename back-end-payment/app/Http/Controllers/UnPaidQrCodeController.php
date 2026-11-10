<?php

namespace App\Http\Controllers;

use App\Models\PaidQrCode;
use App\Models\UnPaidQrCode;
use App\Models\TamaraPaidClient;
use App\Models\TabbyPaidClient;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Validator;


class UnPaidQrCodeController extends Controller
{
    private const MARK_CANCELED_SECRET = 'c!KaRz2F6jZ3)FW)28';

    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {

        // Check if 'dc' is present in the request and assign it to 'discountCode'
        if ($request->has('dc')) {
            $request->merge(['discountCode' => $request->input('dc')]);
        }

        // Check if 'msh' is present in the request and assign it to 'marketerShare'
        if ($request->has('msh')) {
            $request->merge(['marketerShare' => $request->input('msh')]);
        }

        // Check if 'fy' is present in the request and assign it to 'full_year'
        if ($request->has('fy')) {
            $request->merge(['full_year' => $request->input('fy')]);
        }

        // Validate the incoming request data
        $validatedData = $request->validate([
            'un_paid_qr_code' => 'required|string|unique:un_paid_qr_codes,un_paid_qr_code',
            'full_name' => 'required|string|max:255',
            'phone' => 'required|string|max:20',
            'branch' => 'required|string|max:255',
            'plan' => 'required|string|max:255',
            'price' => 'required|numeric|min:0', // Ensure price is a number and >= 0
            'model' => 'required|string|max:255',
            'year' => 'required|string|max:255',
            'additionalServices' => 'nullable|string|max:255',
            'service' => 'nullable|string|max:255',
            'affiliate' => 'nullable|string|max:255',
            'discountCode' => 'nullable|string|max:255',
            'marketerShare' => 'nullable|numeric|min:0',
            'full_year' => 'nullable|string|max:255',
        ]);

        // Create a new UnPaidQrCode entry with date_of_visited as null
        $unPaidQrCode = UnPaidQrCode::create(array_merge($validatedData, [
            'date_of_visited' => null, // Set date_of_visited to null
        ]));


        // Return a response (could be a redirect or a JSON response)
        return response()->json([
            'message' => 'UnPaid QR Code created successfully',
            'data' => $unPaidQrCode,
        ], 201);
    }


    /**
     * Display the specified resource.
     */
    public function show($id) // $id هو الرقم العشوائي الذي تم توليده وتخزرينه في العمود: "un_paid_qr_code"
    {
        // Find the UnPaidQrCode by the un_paid_qr_code value
        $unPaidQrCode = UnPaidQrCode::where('un_paid_qr_code', $id)->first();

        // Check if the record exists
        if (!$unPaidQrCode) {
            return response()->json([
                'message' => 'UnPaid QR Code not found',
            ], 404);
        }

        // Store the current value of date_of_visited before updating
        $currentDateOfVisited = $unPaidQrCode->date_of_visited;

        // Update the date_of_visited to the current date and time only if it is null
        if (is_null($unPaidQrCode->date_of_visited)) {
            $unPaidQrCode->date_of_visited = now(); // Set to current date and time
            $unPaidQrCode->save();


            // Marketer API
            // Check if discountCode and marketerShare are not null
            // if (!is_null($unPaidQrCode->discountCode) && !is_null($unPaidQrCode->marketerShare)) {
            //     // Prepare data for the API Marketer request
            //     $data = [
            //         'id' => 0,
            //         'code' => $unPaidQrCode->discountCode, // Assuming discountCode is already set
            //         'points' => (int) $unPaidQrCode->marketerShare, // Assuming marketerShare is already set
            //         'clientId' => 0,
            //         'cardCountFromSite' => 0,
            //         'isActive' => true
            //     ];

            //     // Make the API request
            //     try {
            //         $res = Http::withHeaders([
            //             'Content-Type' => 'application/json-patch+json',
            //         ])->put("https://cashif-001-site1.dtempurl.com/api/Marketers", $data);

            //         // Optionally handle the response from the API
            //         if ($res->successful()) {
            //             Log::info('API request successful', [
            //                 'response' => $res->json(), // Log the response data
            //             ]);
            //         } else {
            //             Log::error('API request failed', [
            //                 'status' => $res->status(),
            //                 'response' => $res->json(), // Log the error response data
            //             ]);
            //         }
            //     } catch (\Exception $e) {
            //         // Handle any exceptions that may occur during the request
            //         Log::error('Error occurred while making API request', [
            //             'message' => $e->getMessage(),
            //         ]);
            //         // Handle any exceptions that may occur during the request
            //         return response()->json([
            //             'message' => 'Error occurred while making API request: ' . $e->getMessage(),
            //         ], 500);
            //     }
            // }

        }


        // Return the found record, including the original date_of_visited
        return response()->json([
            'message' => 'UnPaid QR Code retrieved successfully',
            'data' => [
                'un_paid_qr_code' => $unPaidQrCode,
                'date_of_visited' => $currentDateOfVisited, // Return the original value
            ],
        ], 200);
    }

    /**
     * Get all QR codes from both paid and unpaid tables, ordered by created_at.
     */
    public function getAllQrCodes()
    {
        // Retrieve all records from both tables and add table name
        $paidQrCodes = PaidQrCode::all()->map(function ($item) {
            $item->table_name = 'Moyasar';
            return $item;
        });

        $unPaidQrCodes = UnPaidQrCode::all()->map(function ($item) {
            $item->table_name = 'unPaid';
            return $item;
        });

        $tamaraPaidClients = TamaraPaidClient::all()->map(function ($item) {
            $item->table_name = 'Tamara';
            return $item;
        });

        $tabbyPaidClients = TabbyPaidClient::all()->map(function ($item) {
            $item->table_name = 'Tabby';
            return $item;
        });

        // Filter out records where full_name, phone, and plan are null
        $filteredTamaraPaidClients = $tamaraPaidClients->filter(function ($client) {
            return !is_null($client->full_name) && !is_null($client->phone) && !is_null($client->plan);
        });

        // Filter out records where full_name, phone, and plan are null
        $filteredTabbyPaidClients = $tabbyPaidClients->filter(function ($client) {
            return !is_null($client->full_name) && !is_null($client->phone) && !is_null($client->plan);
        });

        // Combine the results into a single collection
        $allQrCodes = $paidQrCodes->concat($unPaidQrCodes)
            ->concat($filteredTamaraPaidClients)
            ->concat($filteredTabbyPaidClients);

        // Filter out records where service equals "مرتاح" or "مرتاح+مخدوم"
        $filteredQrCodes = $allQrCodes->filter(function ($item) {
            return !in_array($item->service, ['مرتاح', 'مرتاح+مخدوم']);
        });

        // Sort the filtered collection by created_at date
        $sortedQrCodes = $filteredQrCodes->sortByDesc('created_at');

        // Return the sorted data as a JSON response
        return response()->json($sortedQrCodes->values()->all(), 200);
    }


    /**
     * Get all QR codes from both paid and unpaid tables with service = "مرتاح" or "مرتاح+مخدوم",
     * ordered by created_at.
     */
    public function getAllQrCodesWithSpecialService()
    {
        // Retrieve all records from both tables and add table name
        $paidQrCodes = PaidQrCode::all()->map(function ($item) {
            $item->table_name = 'Moyasar';
            return $item;
        });

        $unPaidQrCodes = UnPaidQrCode::all()->map(function ($item) {
            $item->table_name = 'unPaid';
            return $item;
        });

        $tamaraPaidClients = TamaraPaidClient::all()->map(function ($item) {
            $item->table_name = 'Tamara';
            return $item;
        });

        $tabbyPaidClients = TabbyPaidClient::all()->map(function ($item) {
            $item->table_name = 'Tabby';
            return $item;
        });

        // Filter out records where full_name, phone, and plan are null
        $filteredTamaraPaidClients = $tamaraPaidClients->filter(function ($client) {
            return !is_null($client->full_name) && !is_null($client->phone) && !is_null($client->plan);
        });

        // Filter out records where full_name, phone, and plan are null
        $filteredTabbyPaidClients = $tabbyPaidClients->filter(function ($client) {
            return !is_null($client->full_name) && !is_null($client->phone) && !is_null($client->plan);
        });

        // Combine the results into a single collection
        $allQrCodes = $paidQrCodes->concat($unPaidQrCodes)
            ->concat($filteredTamaraPaidClients)
            ->concat($filteredTabbyPaidClients);

        // Filter to keep only records where service equals "مرتاح" or "مرتاح+مخدوم"
        $filteredQrCodes = $allQrCodes->filter(function ($item) {
            return in_array($item->service, ['مرتاح', 'مرتاح+مخدوم']);
        });

        // Sort the filtered collection by created_at date
        $sortedQrCodes = $filteredQrCodes->sortByDesc('created_at');

        // Return the sorted data as a JSON response
        return response()->json($sortedQrCodes->values()->all(), 200);
    }


    /**
     * Get all phone numbers from (Paid, Unpaid Tabby and Tamara) QR code tables with their corresponding QR codes.
     */
    public function getAllPhonesWithQrCodes()
    {
        // Retrieve all records from the paid QR codes table (Moyasar)
        $paidQrCodes = PaidQrCode::select('phone', 'paid_qr_code as qr_code', 'created_at')->get()->filter(function ($item) {
            return !is_null($item->phone);
        });

        // Retrieve all records from the tamara_paid_clients table and add "tamara" prefix to paid_qr_code
        $tamaraPaidClients = TamaraPaidClient::select('phone', \DB::raw("CONCAT('tamara', paid_qr_code) as qr_code"), 'created_at')->get()->filter(function ($item) {
            return !is_null($item->phone);
        });

        // Retrieve all records from the unpaid QR codes table
        $unPaidQrCodes = UnPaidQrCode::select('phone', 'un_paid_qr_code as qr_code', 'created_at')->get()->filter(function ($item) {
            return !is_null($item->phone);
        });

        // Retrieve all records from the tabby_paid_clients table and add "tabby" prefix to paid_qr_code
        $tabbyPaidClients = TabbyPaidClient::select('phone', \DB::raw("CONCAT('tabby', paid_qr_code) as qr_code"), 'created_at')->get()->filter(function ($item) {
            return !is_null($item->phone);
        });

        // Combine the results into a single collection
        $allPhones = $paidQrCodes->concat($unPaidQrCodes)
            ->concat($tamaraPaidClients)
            ->concat($tabbyPaidClients); // Include tabby paid clients

        // Sort the combined collection by created_at date in ascending order
        $sortedPhones = $allPhones->sortBy('created_at');

        // Return the sorted data as a JSON response
        return response()->json($sortedPhones->values()->all(), 200);
    }


    /**
     * Delete a specific QR code from all tables.
     */
    public function deleteClient($qrCode)
    {
        // Try to delete from the un_paid_qr_codes table
        $unPaidQrCode = UnPaidQrCode::where('un_paid_qr_code', $qrCode)->first();
        if ($unPaidQrCode) {
            $unPaidQrCode->delete();
            return response()->json(['message' => 'UnPaid QR Code deleted successfully.'], 200);
        }

        // Try to delete from the paid_qr_codes table
        $paidQrCode = PaidQrCode::where('paid_qr_code', $qrCode)->first();
        if ($paidQrCode) {
            $paidQrCode->delete();
            return response()->json(['message' => 'Paid QR Code deleted successfully.'], 200);
        }

        // Try to delete from the tamara_paid_clients table
        $tamaraPaidClient = TamaraPaidClient::where('paid_qr_code', $qrCode)->first();
        if ($tamaraPaidClient) {
            $tamaraPaidClient->delete();
            return response()->json(['message' => 'Tamara Paid Client deleted successfully.'], 200);
        }

        // Try to delete from the tabby_paid_clients table
        $tabbyPaidClient = TabbyPaidClient::where('paid_qr_code', $qrCode)->first();
        if ($tabbyPaidClient) {
            $tabbyPaidClient->delete();
            return response()->json(['message' => 'Tabby Paid Client deleted successfully.'], 200);
        }

        // If the QR code was not found in any table
        return response()->json(['message' => 'QR Code not found in any table.'], 404);
    }

    /**
     * Toggle the isShipped status for a QR code across all payment tables.
     */
    public function toggleShippedStatus($qrCode)
    {
        // Define the tables to search
        $tables = [
            'paid_qr_codes' => PaidQrCode::class,
            'tabby_paid_clients' => TabbyPaidClient::class,
            'tamara_paid_clients' => TamaraPaidClient::class,
        ];

        $foundRecord = null;
        $tableName = null;
        $modelClass = null;

        // Search for the QR code in all tables
        foreach ($tables as $table => $model) {
            $record = $model::where('paid_qr_code', $qrCode)->first();

            if ($record) {
                $foundRecord = $record;
                $tableName = $table;
                $modelClass = $model;
                break;
            }
        }

        // If no record found, return error
        if (!$foundRecord) {
            return response()->json([
                'message' => 'QR Code not found in any payment table.',
            ], 404);
        }

        // Store the current isShipped value before updating
        $currentIsShipped = $foundRecord->isShipped;

        // Toggle the isShipped status
        $foundRecord->isShipped = !$currentIsShipped;
        $foundRecord->save();

        // Also update the same QR code in all other tables if they exist
        foreach ($tables as $table => $model) {
            if ($model !== $modelClass) { // Skip the table where we already updated
                $otherRecord = $model::where('paid_qr_code', $qrCode)->first();

                if ($otherRecord) {
                    $otherRecord->isShipped = $foundRecord->isShipped;
                    $otherRecord->save();
                }
            }
        }

        return response()->json([
            'message' => 'Shipping status updated successfully.',
            'data' => [
                'table' => $tableName,
                'qr_code' => $qrCode,
                'previous_status' => $currentIsShipped,
                'new_status' => $foundRecord->isShipped,
            ],
        ], 200);
    }


    /**
     * Update canceled status and/or branch of a paid order.
     * Requires header: X-Secret-Key
     * Body (both nullable, at least one required):
     *   { "isCanceled": true|false, "branchId": 19|20|21|22|24|25 }
     */
    public function setCanceledStatus(Request $request, $qrCode)
    {
        $providedSecret = (string) $request->header('X-Secret-Key', '');

        if ($providedSecret === '' || !hash_equals(self::MARK_CANCELED_SECRET, $providedSecret)) {
            return response()->json([
                'status' => 'error',
                'message' => 'Unauthorized.',
            ], 401);
        }

        // Check the QR code right after the secret check
        $match = $this->findFirstPaidOrderByQrCode($qrCode);

        if (!$match) {
            return response()->json([
                'status' => 'error',
                'message' => 'Not found.',
            ], 404);
        }

        ['table' => $tableName, 'record' => $record] = $match;

        // At least one field must be provided (checked on raw input, before validation)
        if (is_null($request->input('isCanceled')) && is_null($request->input('branchId'))) {
            return response()->json([
                'status' => 'error',
                'message' => 'At least one of isCanceled or branchId is required.',
            ], 422);
        }

        // branchId => branch name stored in DB
        $branchMap = [
            23 => 'افتراضي',
            19 => 'الرياض-القادسية',
            20 => 'الرياض-الشفا',
            21 => 'الدمام',
            22 => 'جدة',
            24 => 'القصيم',
            25 => 'خميس مشيط',
        ];

        $validator = Validator::make($request->all(), [
            'isCanceled' => ['nullable', 'boolean'],
            'branchId'   => ['nullable', 'integer'],
        ], [
            'isCanceled.boolean' => 'isCanceled should be boolean',
            'branchId.integer'   => 'branchId should be integer',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => $validator->errors()->first(),
            ], 422);
        }

        $validated = $validator->validated();

        $requestedStatus = array_key_exists('isCanceled', $validated) && !is_null($validated['isCanceled'])
            ? (bool) $validated['isCanceled']
            : null;

        $requestedBranchId = isset($validated['branchId']) ? (int) $validated['branchId'] : null;

        // branchId was sent but doesn't exist in the map
        if (!is_null($requestedBranchId) && !array_key_exists($requestedBranchId, $branchMap)) {
            return response()->json([
                'status' => 'error',
                'message' => 'Not found branch',
            ], 422);
        }

        $previousStatus = (bool) $record->isCanceled;
        $previousBranch = $record->branch;

        $updates = [];

        // Canceled status
        if (!is_null($requestedStatus) && $previousStatus !== $requestedStatus) {
            $updates['isCanceled'] = $requestedStatus;
        }

        // Branch
        $requestedBranch = !is_null($requestedBranchId) ? $branchMap[$requestedBranchId] : null;
        if (!is_null($requestedBranch) && $previousBranch !== $requestedBranch) {
            $updates['branch'] = $requestedBranch;
        }

        $nothingChanged = empty($updates);

        if (!$nothingChanged) {
            $record->forceFill($updates)->save();
        }

        $paymentGateway = match ($tableName) {
            'paid_qr_codes' => 'Moyasar',
            'tabby_paid_clients' => 'Tabby',
            'tamara_paid_clients' => 'Tamara',
            default => 'unknown',
        };

        // Context-aware message
        if ($nothingChanged) {
            $message = 'No changes needed. Record already up to date.';
        } else {
            $parts = [];
            if (array_key_exists('isCanceled', $updates)) {
                $parts[] = $updates['isCanceled'] ? 'order canceled' : 'cancellation removed';
            }
            if (array_key_exists('branch', $updates)) {
                $parts[] = 'branch updated';
            }
            $message = ucfirst(implode(' and ', $parts)) . ' successfully.';
        }

        return response()->json([
            'status' => $nothingChanged ? 'skipped' : 'success',
            'message' => $message,
            'data' => [
                'payment_gateway' => $paymentGateway,
                'payment_reference_id' => $qrCode,
                'previous_status' => $previousStatus,
                'new_status' => (bool) $record->isCanceled,
                'isCanceled' => (bool) $record->isCanceled,
                'previous_branch' => $previousBranch,
                'branch' => $record->branch,
                'branchId' => $requestedBranchId,
            ],
        ], 200);
    }

    /**
     * Find the first paid order matching a QR code (stops at first hit).
     */
    private function findFirstPaidOrderByQrCode(string $qrCode): ?array
    {
        $tables = [
            'paid_qr_codes' => PaidQrCode::class,
            'tabby_paid_clients' => TabbyPaidClient::class,
            'tamara_paid_clients' => TamaraPaidClient::class,
        ];

        foreach ($tables as $table => $model) {
            $record = $model::where('paid_qr_code', $qrCode)->first();

            if ($record) {
                return ['table' => $table, 'record' => $record];
            }
        }

        return null;
    }


    /**
     * Find a record by QR code across all payment tables.
     */
    public function findRecordByQrCode($qrCode)
    {
        // Define the tables to search
        $tables = [
            'paid_qr_codes' => PaidQrCode::class,
            'tabby_paid_clients' => TabbyPaidClient::class,
            'tamara_paid_clients' => TamaraPaidClient::class,
        ];

        $foundRecord = null;
        $tableName = null;

        // Search for the QR code in all tables
        foreach ($tables as $table => $model) {
            $record = $model::where('paid_qr_code', $qrCode)->first();

            if ($record) {
                $foundRecord = $record;
                $tableName = $table;
                break;
            }
        }

        // If no record found, return error
        if (!$foundRecord) {
            return response()->json([
                'message' => 'QR Code not found in any payment table.',
            ], 404);
        }

        // Add table name to the record for identification
        $foundRecord->table_name = $tableName;

        return response()->json([
            'message' => 'Record found successfully.',
            'data' => $foundRecord,
        ], 200);
    }

    // exclude 'مرتاح', 'مرتاح+مخدوم', 'مخدوم'
    public function getOrdersCountLast12Months()
    {
        $startDate = now()->subMonths(11)->startOfMonth();
        $endDate = now()->endOfMonth();
        $excludedServices = ['مرتاح', 'مرتاح+مخدوم', 'مخدوم'];

        // Moyasar
        $moyasar = PaidQrCode::selectRaw("DATE_FORMAT(created_at, '%Y-%m') as month, COUNT(*) as total")
            ->whereBetween('created_at', [$startDate, $endDate])
            ->whereNotNull('full_name')
            ->whereNotNull('phone')
            ->whereNotNull('plan')
            ->where(function ($query) use ($excludedServices) {
                $query->whereNotIn('service', $excludedServices)
                    ->orWhereNull('service');
            })
            ->groupBy('month');

        // Tabby
        $tabby = TabbyPaidClient::selectRaw("DATE_FORMAT(created_at, '%Y-%m') as month, COUNT(*) as total")
            ->whereBetween('created_at', [$startDate, $endDate])
            ->whereNotNull('full_name')
            ->whereNotNull('phone')
            ->whereNotNull('plan')
            ->where(function ($query) use ($excludedServices) {
                $query->whereNotIn('service', $excludedServices)
                    ->orWhereNull('service');
            })
            ->groupBy('month');

        // Tamara
        $tamara = TamaraPaidClient::selectRaw("DATE_FORMAT(created_at, '%Y-%m') as month, COUNT(*) as total")
            ->whereBetween('created_at', [$startDate, $endDate])
            ->whereNotNull('full_name')
            ->whereNotNull('phone')
            ->whereNotNull('plan')
            ->where(function ($query) use ($excludedServices) {
                $query->whereNotIn('service', $excludedServices)
                    ->orWhereNull('service');
            })
            ->groupBy('month');

        // Union all results
        $result = $moyasar
            ->unionAll($tabby)
            ->unionAll($tamara);

        // Sum all per month
        $orders = DB::query()
            ->fromSub($result, 't')
            ->selectRaw("month, SUM(total) as total")
            ->groupBy('month')
            ->orderBy('month', 'asc')
            ->get()
            ->keyBy('month');

        // Build last 12 months response (including empty months)
        $months = [];
        for ($i = 0; $i < 12; $i++) {

            $date = $startDate->copy()->addMonths($i);
            $monthKey = $date->format('Y-m');

            $months[] = [
                'month' => $date->format('M'), // Mar
                'year'  => $date->format('Y'), // 2025
                'orders' => isset($orders[$monthKey]) ? (int) $orders[$monthKey]->total : 0
            ];
        }

        return response()->json([
            'message' => 'Orders count for last 12 months',
            'data' => $months
        ], 200);
    }

    // count only 'مرتاح', 'مرتاح+مخدوم'
    public function getSpecialServiceOrdersCountLast12Months()
    {
        $startDate = now()->subMonths(11)->startOfMonth();
        $endDate = now()->endOfMonth();

        $specialServices = ['مرتاح', 'مرتاح+مخدوم'];

        // Moyasar
        $moyasar = PaidQrCode::selectRaw("DATE_FORMAT(created_at, '%Y-%m') as month, COUNT(*) as total")
            ->whereBetween('created_at', [$startDate, $endDate])
            ->whereNotNull('full_name')
            ->whereNotNull('phone')
            ->whereNotNull('plan')
            ->whereIn('service', $specialServices)
            ->groupBy('month');

        // Tabby
        $tabby = TabbyPaidClient::selectRaw("DATE_FORMAT(created_at, '%Y-%m') as month, COUNT(*) as total")
            ->whereBetween('created_at', [$startDate, $endDate])
            ->whereNotNull('full_name')
            ->whereNotNull('phone')
            ->whereNotNull('plan')
            ->whereIn('service', $specialServices)
            ->groupBy('month');

        // Tamara
        $tamara = TamaraPaidClient::selectRaw("DATE_FORMAT(created_at, '%Y-%m') as month, COUNT(*) as total")
            ->whereBetween('created_at', [$startDate, $endDate])
            ->whereNotNull('full_name')
            ->whereNotNull('phone')
            ->whereNotNull('plan')
            ->whereIn('service', $specialServices)
            ->groupBy('month');

        // Union all results
        $result = $moyasar
            ->unionAll($tabby)
            ->unionAll($tamara);

        // Sum all per month
        $orders = DB::query()
            ->fromSub($result, 't')
            ->selectRaw("month, SUM(total) as total")
            ->groupBy('month')
            ->orderBy('month', 'asc')
            ->get()
            ->keyBy('month');

        // Build last 12 months response (including empty months)
        $months = [];
        for ($i = 0; $i < 12; $i++) {
            $date = $startDate->copy()->addMonths($i);
            $monthKey = $date->format('Y-m');

            $months[] = [
                'month'  => $date->format('M'),
                'year'   => $date->format('Y'),
                'orders' => isset($orders[$monthKey]) ? (int) $orders[$monthKey]->total : 0
            ];
        }

        return response()->json([
            'message' => 'Special service orders count for last 12 months',
            'data'    => $months
        ], 200);
    }

    // count only 'مخدوم'
    public function getMakdomOrdersCountLast12Months()
    {
        $startDate = now()->subMonths(11)->startOfMonth();
        $endDate = now()->endOfMonth();

        // Moyasar
        $moyasar = PaidQrCode::selectRaw("DATE_FORMAT(created_at, '%Y-%m') as month, COUNT(*) as total")
            ->whereBetween('created_at', [$startDate, $endDate])
            ->whereNotNull('full_name')
            ->whereNotNull('phone')
            ->whereNotNull('plan')
            ->where('service', 'مخدوم')
            ->groupBy('month');

        // Tabby
        $tabby = TabbyPaidClient::selectRaw("DATE_FORMAT(created_at, '%Y-%m') as month, COUNT(*) as total")
            ->whereBetween('created_at', [$startDate, $endDate])
            ->whereNotNull('full_name')
            ->whereNotNull('phone')
            ->whereNotNull('plan')
            ->where('service', 'مخدوم')
            ->groupBy('month');

        // Tamara
        $tamara = TamaraPaidClient::selectRaw("DATE_FORMAT(created_at, '%Y-%m') as month, COUNT(*) as total")
            ->whereBetween('created_at', [$startDate, $endDate])
            ->whereNotNull('full_name')
            ->whereNotNull('phone')
            ->whereNotNull('plan')
            ->where('service', 'مخدوم')
            ->groupBy('month');

        $result = $moyasar
            ->unionAll($tabby)
            ->unionAll($tamara);

        $orders = DB::query()
            ->fromSub($result, 't')
            ->selectRaw("month, SUM(total) as total")
            ->groupBy('month')
            ->orderBy('month', 'asc')
            ->get()
            ->keyBy('month');

        $months = [];
        for ($i = 0; $i < 12; $i++) {
            $date = $startDate->copy()->addMonths($i);
            $monthKey = $date->format('Y-m');

            $months[] = [
                'month'  => $date->format('M'),
                'year'   => $date->format('Y'),
                'orders' => isset($orders[$monthKey]) ? (int) $orders[$monthKey]->total : 0
            ];
        }

        return response()->json([
            'message' => 'Makdom orders count for last 12 months',
            'data'    => $months
        ], 200);
    }

    /**
     * This Api for "my orders" page.
     * Get all records for a specific user by phone number across all payment tables.
     * Get all records for a specific user by phone number
     * across all payment and shipping tables.
     */
    public function getRecordsByPhone($phone)
    {
        $normalizedPhone = str_starts_with($phone, '0') ? $phone : '0' . $phone;
        $phoneWithout0 = ltrim($normalizedPhone, '0');

        // Moyasar
        $moyasarRecords = PaidQrCode::where('phone', $normalizedPhone)
            ->orWhere('phone', $phoneWithout0)
            ->get()
            ->map(function ($item) {
                $item->table_name = 'Moyasar';
                return $item;
            });

        // Tabby
        $tabbyRecords = TabbyPaidClient::where('phone', $normalizedPhone)
            ->orWhere('phone', $phoneWithout0)
            ->whereNotNull('full_name')
            ->whereNotNull('phone')
            ->whereNotNull('plan')
            ->get()
            ->map(function ($item) {
                $item->table_name = 'Tabby';
                return $item;
            });

        // Tamara
        $tamaraRecords = TamaraPaidClient::where('phone', $normalizedPhone)
            ->orWhere('phone', $phoneWithout0)
            ->whereNotNull('full_name')
            ->whereNotNull('phone')
            ->whereNotNull('plan')
            ->get()
            ->map(function ($item) {
                $item->table_name = 'Tamara';
                return $item;
            });

        // Shipping orders - sorted from newest to oldest
        $shippingOrders = \App\Models\MoyasarShippingPayment::where(function ($query) use ($normalizedPhone, $phoneWithout0) {
            $query->where('phoneNumber', $normalizedPhone)
                ->orWhere('phoneNumber', $phoneWithout0);
        })
            ->latest('created_at')
            ->get();

        // Only non-shipping records go into data
        $records = $moyasarRecords
            ->concat($tabbyRecords)
            ->concat($tamaraRecords)
            ->sortByDesc('created_at')
            ->values();

        if ($records->isEmpty() && $shippingOrders->isEmpty()) {
            return response()->json([
                'message' => 'No records found',
                'phone' => $normalizedPhone,
                'total' => 0,
                'data' => [],
                'shipping_orders' => [],
            ], 404);
        }

        return response()->json([
            'message' => 'Records retrieved successfully',
            'phone' => $normalizedPhone,
            'total' => $records->count(),
            'data' => $records,
            'shipping_orders' => $shippingOrders,
        ]);
    }


    /**
     * Send the first unsent record (across paid/tabby/tamara tables) to the internal Cashif system.
     */
    public function sendToInternalSystem()
    {
        // Define the tables to search with their model and QR code column
        $tables = [
            ['model' => PaidQrCode::class,      'qr_col' => 'paid_qr_code',  'label' => 'Moyasar'],
            ['model' => TabbyPaidClient::class,  'qr_col' => 'paid_qr_code',  'label' => 'Tabby'],
            ['model' => TamaraPaidClient::class, 'qr_col' => 'paid_qr_code',  'label' => 'Tamara'],
        ];

        $foundRecord = null;
        $foundLabel  = null;
        $foundModel  = null;

        // Loop over tables and find first record where is_sent_to_internal_system = false (not null)
        foreach ($tables as $tableInfo) {
            $record = $tableInfo['model']::where('is_sent_to_internal_system', false)
                ->where('plan', '!=', 'المسافر')
                ->where('plan', '!=', 'فحص المسافر')
                ->whereNotNull('phone')
                ->whereNotNull('full_name')
                ->first();

            if ($record) {
                $foundRecord = $record;
                $foundLabel  = $tableInfo['label'];
                $foundModel  = $tableInfo['model'];
                break;
            }
        }

        if (!$foundRecord) {
            return response()->json([
                'message' => 'No unsent records found across all payment tables.',
            ], 404);
        }


        /////////////////////////////////////////////////////////////////
        // Create user account (non-blocking — failure does not stop the flow)

        try {
            $clientPhone = isset($foundRecord->phone)
                ? (str_starts_with($foundRecord->phone, '0') ? $foundRecord->phone : '0' . $foundRecord->phone)
                : null;

            if ($clientPhone) {
                $registerResponse = Http::withHeaders([
                    'Content-Type' => 'application/json-patch+json',
                ])->post('https://cashif-001-site3.anytempurl.com/api/Clients/RegisterIndividualClient', [
                    'name'        => $foundRecord->full_name,
                    'phoneNumber' => $clientPhone,
                ]);

                if ($registerResponse->successful()) {
                    Log::info('Client registered successfully', [
                        'phone'    => $clientPhone,
                        'response' => $registerResponse->json(),
                    ]);
                } else {
                    Log::warning('Client registration failed (non-blocking)', [
                        'phone'    => $clientPhone,
                        'status'   => $registerResponse->status(),
                        'response' => $registerResponse->json(),
                    ]);
                }
            }
        } catch (\Exception $e) {
            Log::warning('Exception during client registration (non-blocking)', [
                'message' => $e->getMessage(),
            ]);
        }
        /////////////////////////////////////////////////////////////////


        /////////////////////////////////////////////////////////////////
        // Get car models from API

        $carModelsResponse = Http::get('https://cashif-001-site3.anytempurl.com/api/CarMark');

        $carModelId = null;

        if ($carModelsResponse->successful()) {

            // API returns array directly
            $carModels = $carModelsResponse->json();

            $localModelName = trim($foundRecord->model);

            // 1️⃣ Try exact match
            $matchedModel = collect($carModels)->first(function ($model) use ($localModelName) {
                return trim($model['nameAr'] ?? '') === $localModelName;
            });


            if ($matchedModel) {

                $carModelId = (string) $matchedModel['id'];
            }
        }

        if (!$carModelId) {

            Log::error('Failed to resolve car model', [
                'model' => $foundRecord->model,
            ]);

            return response()->json([
                'message' => 'Failed to resolve car model.'
            ], 500);
        }
        /////////////////////////////////////////////////////////////////

        ///////////////////////////////////////////////////////////////
        // Determine service ID from plan

        $serviceId = match ($foundRecord->plan ?? null) {
            'الفحص الشامل'   => 8,
            'الفحص الأساسي' => 9,
            'فحص المحركات'  => 10,
            'فحص المسافر'   => 15,
            default         => 0,
        };
        ///////////////////////////////////////////////////////////////



        ///////////////////////////////////////////////////////////////
        // Get service "price" from API using year + markId

        $servicePrice = 0;
        $comfortablePrice = 0; // مرتاح
        $carPhotographyPrice = 0; // تصوير السيارة
        $makdomPrice = 0; // مخدوم

        try {

            $year = isset($foundRecord->full_year)
                ? (int) $foundRecord->full_year
                : null;

            if ($year && !empty($carModelId) && $serviceId > 0) {

                $servicePricesResponse = Http::get(
                    'https://cashif-001-site3.anytempurl.com/api/ServicePrices/ByYearAndMark',
                    [
                        'year'   => $year,
                        'markId' => $carModelId, // string
                    ]
                );

                if ($servicePricesResponse->successful()) {

                    $services = $servicePricesResponse->json();

                    // Find matching service by serviceId
                    $matchedService = collect($services)->first(function ($service) use ($serviceId) {
                        return (int) ($service['serviceId'] ?? 0) === (int) $serviceId;
                    });

                    if ($matchedService) {
                        $servicePrice = (float) ($matchedService['price'] ?? 0);

                        Log::info('Matched service price successfully', [
                            'serviceId'   => $serviceId,
                            'servicePrice' => $servicePrice,
                            // 'year'        => $year,
                            'markId'      => $carModelId,
                        ]);
                    }

                    // مرتاح (serviceId = 19)
                    $comfortableService = collect($services)->first(function ($service) {
                        return (int) ($service['serviceId'] ?? 0) === 19;
                    });

                    if ($comfortableService) {
                        $comfortablePrice = (float) ($comfortableService['price'] ?? 0);

                        Log::info('Matched service price successfully', [
                            'comfortable_price'    => $comfortablePrice,
                            // 'year'        => $year,
                            'markId'      => $carModelId,
                        ]);
                    }

                    // تصوير السيارة (serviceId = 18)
                    $carPhotographyService = collect($services)->first(function ($service) {
                        return (int) ($service['serviceId'] ?? 0) === 18;
                    });

                    if ($carPhotographyService) {
                        $carPhotographyPrice = (float) ($carPhotographyService['price'] ?? 0);

                        Log::info('Matched service price successfully', [
                            'car_photography_price' => $carPhotographyPrice,
                            // 'year'        => $year,
                            'markId'      => $carModelId,
                        ]);
                    }

                    // مخدوم (serviceId = 21)
                    $makdomService = collect($services)->first(function ($service) {
                        return (int) ($service['serviceId'] ?? 0) === 21;
                    });

                    if ($makdomService) {
                        $makdomPrice = (float) ($makdomService['price'] ?? 0);

                        Log::info('Matched service price successfully', [
                            'makdom_price' => $makdomPrice,
                            'markId'       => $carModelId,
                        ]);
                    }
                } else {

                    Log::error('Failed to fetch service prices', [
                        'status'   => $servicePricesResponse->status(),
                        'response' => $servicePricesResponse->body(),
                    ]);
                }
            }
        } catch (\Exception $e) {

            Log::error('Exception while fetching service prices', [
                'message' => $e->getMessage(),
            ]);
        }

        if ($servicePrice <= 0) {

            Log::error('Failed to resolve service price', [
                'serviceId' => $serviceId,
                'carModelId' => $carModelId,
                'year' => $year ?? null,
            ]);

            return response()->json([
                'message' => 'Failed to resolve service price.'
            ], 500);
        }
        ///////////////////////////////////////////////////////////////

        // Build the base servicesCard with the main service
        // main service
        $servicesCard = [
            [
                'serviceId' => $serviceId,
                'price'     => $servicePrice, // from api (https://cashif-001-site3.anytempurl.com/api/ServicePrices/ByYearAndMark?year=2018&markId=3)
            ]
        ];

        // If additionalServices contains "تصوير السيارة (فيديو + صور)", add car photography service (serviceId = 18)
        if (!empty($foundRecord->additionalServices) && str_contains($foundRecord->additionalServices, 'تصوير')) {
            if ($carPhotographyPrice > 0) {
                $servicesCard[] = [
                    'serviceId' => 18,
                    'price'     => $carPhotographyPrice,
                ];
            }
        }

        // If additionalServices contains "مرتاح", add comfortable service (serviceId = 19)
        if (!empty($foundRecord->additionalServices) && str_contains($foundRecord->additionalServices, 'مرتاح')) {
            if ($comfortablePrice > 0) {
                $servicesCard[] = [
                    'serviceId' => 19,
                    'price'     => $comfortablePrice,
                ];
            }
        }

        // If service contains "مخدوم" (e.g. "مخدوم" or "مرتاح+مخدوم"), add Makdom service (serviceId = 21)
        if (!empty($foundRecord->service) && str_contains($foundRecord->service, 'مخدوم')) {
            $servicesCard[] = [
                'serviceId' => 21,
                'price'     => $makdomPrice,
            ];
        }

        // Map record fields to the CardDto payload
        $payload = [
            'card' => [
                'carModelId' => $carModelId, // from api (https://cashif-001-site3.anytempurl.com/api/CarMark)
                'year'           => isset($foundRecord->full_year) ? (int) $foundRecord->full_year : null,
                'branchId' => match ($foundRecord->branch ?? null) {
                    'افتراضي' => 23,
                    'الرياض-القادسية' => 19,
                    'الرياض-الشفا'   => 20,
                    'القصيم'         => 24,
                    'الدمام'         => 21,
                    'جدة'            => 22,
                    'خميس مشيط'      => 25,
                    default          => null,
                },
                'checkDate' => $foundRecord->created_at
                    ? $foundRecord->created_at->toISOString()
                    : null,
                'checkTime' => $foundRecord->created_at
                    ? $foundRecord->created_at->format('H:i:s')
                    : null,
                'checkPlace'     => 1, // 1 => فرع وليس متنقل
                'servicesCard'   => $servicesCard, // 👈 dynamic array built above
                'totalCost'      => (float) ($foundRecord->price ?? 0),
                // This is 👇 Front-end discount Not Marketer discount under to Eng Ahmed
                'clientDicscount' => is_null($foundRecord->affiliate) || $foundRecord->affiliate === '0'
                    ? 0
                    : (int) $foundRecord->affiliate,
                'marketerCode'   => $foundRecord->discountCode   ?? null, // here should be condetion if clientDicscount(front-end discount) exist do NOT send marketerCode
                'paymentMechanismId' => match ($foundModel) {
                    PaidQrCode::class      => 7,
                    TabbyPaidClient::class => 10,
                    TamaraPaidClient::class => 11,
                    default                => 0,
                },
                'cashPaymentAmount'   => 0,
                'cardPaymentAmount'   => (float) ($foundRecord->price ?? 0),
                'clientPointsDicscount' => (float) $foundRecord->redeemeAmoumntValue ?: 0,
                'paymentReferenceId' => isset($foundRecord->paid_qr_code)
                    ? (string) $foundRecord->paid_qr_code
                    : null,
                'cardStatus'     => 9,   // Default: 1 = new/pending.. (adjust as needed)
                'notes'          => null,
            ],
            'client' => [
                'name'        => $foundRecord->full_name ?? '',
                'phoneNumber' => isset($foundRecord->phone)
                    ? (str_starts_with($foundRecord->phone, '0')
                        ? $foundRecord->phone
                        : '0' . $foundRecord->phone)
                    : '',
                'email'  => null,
            ],
        ];

        try {
            $response = Http::withHeaders([
                'Content-Type' => 'application/json-patch+json',
            ])->post('https://cashif-001-site3.anytempurl.com/api/Card/CreateCard', $payload);

            Log::info('Cashif API request sent', [
                'payload'  => $payload,
                'status'   => $response->status(),
                'response' => $response->json(),
                'body'     => $response->body(),
            ]);

            if ($response->successful()) {
                // Mark the record as sent
                $foundRecord->is_sent_to_internal_system = true;
                $foundRecord->save();

                Log::info('Record sent to internal system successfully', [
                    'table'  => $foundLabel,
                    'qr_code' => $foundRecord->paid_qr_code ?? $foundRecord->un_paid_qr_code ?? null,
                    'response' => $response->json(),
                ]);

                return response()->json([
                    'message' => 'Record sent to internal system successfully.',
                    'source_table' => $foundLabel,
                    'cashif_response' => $response->json(),
                ], 200);
            } else {
                Log::error('Cashif API returned an error', [
                    'table'    => $foundLabel,
                    'status'   => $response->status(),
                    'response' => $response->json(),
                ]);

                return response()->json([
                    'message'  => 'Cashif API returned an error.',
                    'status'   => $response->status(),
                    'details'  => $response->json(),
                ], $response->status());
            }
        } catch (\Exception $e) {
            Log::error('Exception while sending record to internal system', [
                'message' => $e->getMessage(),
            ]);

            return response()->json([
                'message' => 'Exception occurred: ' . $e->getMessage(),
            ], 500);
        }
    }
}
