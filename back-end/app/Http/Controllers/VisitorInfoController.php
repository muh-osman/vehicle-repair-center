<?php

namespace App\Http\Controllers;

use App\Models\VisitorInfo;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class VisitorInfoController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $topVisitors = VisitorInfo::selectRaw('
            ip_address,
            country,
            COUNT(*) as visit_count,
            MAX(created_at) as last_visit_at
        ')
            ->where('created_at', '>=', now()->subDay())
            ->groupBy('ip_address', 'country')
            ->orderByDesc('visit_count')
            ->limit(10)
            ->get();

        return response()->json([
            'success' => true,
            'message' => 'Top 10 visitor IPs from last 24 hours with visit counts and last visit date.',
            'data' => $topVisitors
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $visitor = VisitorInfo::create([
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'country' => $this->getCountryFromIP($request->ip()),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Visitor tracked successfully.',
            'data' => $visitor
        ], 201);
    }


    /**
     * Helper function to get country from IP
     */
    private function getCountryFromIP($ip)
    {
        // Skip private/local IPs
        if (!filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE)) {
            return 'Local';
        }

        try {
            $response = file_get_contents("http://ip-api.com/json/{$ip}?fields=country");
            $data = json_decode($response, true);
            return $data['country'] ?? 'Unknown';
        } catch (\Exception $e) {
            \Log::error("GeoIP lookup failed: " . $e->getMessage());
            return 'Unknown';
        }
    }
}
