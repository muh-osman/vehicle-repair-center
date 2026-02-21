<?php

namespace App\Http\Controllers;

use App\Models\VideosReport;
use App\Models\VideosInspection;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Validator;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;


class VideosReportController extends Controller
{
    public function index()
    {
        $reports = VideosReport::with('videos')->latest()->get();

        // Append full video URL for each video
        foreach ($reports as $report) {
            foreach ($report->videos as $video) {
                $video->video_url = asset('report-videos/' . $video->video_path);
            }
        }

        return response()->json($reports);
    }

    public function store(Request $request)
    {
        // validation
        $request->validate([
            'report_number' => 'required|unique:videos_reports',
        ]);

        // create report
        $report = VideosReport::create([
            'report_number' => $request->report_number
        ]);

        return response()->json([
            'message' => 'Created successfully',
            // 'data' => $report->load('videos')
        ], 201);
    }

    public function destroy($id)
    {
        $report = VideosReport::with('videos')->findOrFail($id);

        // Delete video files from folder
        foreach ($report->videos as $video) {
            $filePath = public_path('report-videos/' . $video->video_path);

            if (file_exists($filePath)) {
                unlink($filePath);
            }
        }

        // Delete database records (cascade deletes videos rows)
        $report->delete();

        return response()->json(['message' => 'Deleted successfully']);
    }


    public function update(Request $request, $id)
    {
        $report = VideosReport::findOrFail($id);

        // Validation
        $request->validate([
            'videos.*' => 'file|mimes:mp4,avi,mov',
            'video_type.*' => 'required|string',
            'employee_name.*' => 'required|string',
        ]);

        if ($request->hasFile('videos')) {

            foreach ($request->file('videos') as $index => $videoFile) {

                // Generate UUID filename
                $filename = Str::uuid() . '.' . $videoFile->getClientOriginalExtension();

                // Move to public/report-videos
                $videoFile->move(public_path('report-videos'), $filename);

                // Save record in DB
                VideosInspection::create([
                    'videos_report_id' => $report->id,
                    'video_path'       => $filename, // only filename stored
                    'video_type'       => $request->video_type[$index],
                    'employee_name'    => $request->employee_name[$index],
                ]);
            }
        }

        return response()->json([
            'message' => 'Report updated successfully',
            'data' => $report->load('videos')
        ]);
    }

    //
    public function checkIfCardsHaveVideos(Request $request)
    {
        // Validate request
        $validator = Validator::make($request->all(), [
            'card_ids' => 'required|array',
            'card_ids.*' => 'nullable|integer'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $cardIds = $request->input('card_ids');

        // Remove nulls and non-integers
        $filteredCardIds = array_values(array_filter($cardIds, function ($value) {
            return $value !== null && is_int($value);
        }));

        // If no valid IDs
        if (empty($filteredCardIds)) {
            return response()->json([
                'success' => true,
                'data' => [],
                'message' => 'No valid card IDs provided'
            ]);
        }

        // Get report_numbers that have at least one video
        $existingReports = VideosInspection::whereIn('videos_report_id', function ($query) use ($filteredCardIds) {
            $query->select('id')
                ->from('videos_reports')
                ->whereIn('report_number', $filteredCardIds);
        })
            ->pluck('videos_report_id')
            ->unique()
            ->toArray();

        // Convert report IDs back to report_numbers
        $reportsWithVideos = VideosReport::whereIn('id', $existingReports)
            ->pluck('report_number')
            ->toArray();

        // Build response
        $response = [];
        foreach ($cardIds as $cardId) {
            if ($cardId === null) continue;
            $response[$cardId] = in_array($cardId, $reportsWithVideos);
        }

        return response()->json([
            'success' => true,
            'data' => $response
        ]);
    }

    public function show($report_number)
    {
        $report = VideosReport::where('report_number', $report_number)
            ->with('videos')
            ->first();

        if (!$report) {
            return response()->json([
                'success' => false,
                'message' => 'Report not found'
            ], 404);
        }

        // Build full video URL correctly
        $report->videos->transform(function ($video) {
            $video->video_url = asset('report-videos/' . $video->video_path);
            return $video;
        });

        return response()->json([
            'success' => true,
            'data' => $report
        ]);
    }

    public function analytics(Request $request)
    {
        // ===== Validate Date Range =====
        $validator = Validator::make($request->all(), [
            'from' => 'required|date',
            'to'   => 'required|date|after_or_equal:from',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors'  => $validator->errors()
            ], 422);
        }

        $from = Carbon::parse($request->from)->startOfDay();
        $to   = Carbon::parse($request->to)->endOfDay();

        // =========================================================
        // TABLE 1 → EMPLOYEE PERFORMANCE SUMMARY
        // =========================================================

        $employeeSummary = VideosInspection::whereBetween('created_at', [$from, $to])
            ->where('employee_name', '!=', 'N/A')
            ->whereNotNull('employee_name')
            ->select('employee_name', 'videos_report_id', 'video_type')
            ->get()

            // Remove duplicates: same employee + same report + same type
            ->unique(function ($item) {
                return $item->videos_report_id . '|' . $item->employee_name . '|' . $item->video_type;
            })

            // Group by employee
            ->groupBy('employee_name')

            ->map(function ($rows, $employee) {

                $sharhCount = $rows->where('video_type', 'شرح التقرير')->count();
                $carCount   = $rows->where('video_type', 'فيديو للسيارة')->count();

                return [
                    'employee_name' => $employee,

                    // distinct reports employee worked on
                    'reports_count' => $rows->pluck('videos_report_id')->unique()->count(),

                    // one per report for each type
                    'sharh_count'   => $sharhCount,
                    'car_count'     => $carCount,

                    // total
                    'total_videos'  => $sharhCount + $carCount,
                ];
            })
            ->values();



        // =========================================================
        // TABLE 2 → DETAILED VIDEO LIST
        // =========================================================

        $videosDetails = VideosInspection::whereBetween('created_at', [$from, $to])
            ->where('employee_name', '!=', 'N/A')
            ->whereNotNull('employee_name')
            ->with('report:id,report_number')
            ->orderBy('created_at', 'asc') // ensures "first uploaded" is selected
            ->get()
            ->unique(function ($item) {
                return $item->videos_report_id . '|' . $item->employee_name . '|' . $item->video_type;
            })
            ->values()
            ->map(function ($video) {
                return [
                    'video_type'    => $video->video_type,
                    'report_number' => optional($video->report)->report_number,
                    'employee_name' => $video->employee_name,
                    'uploaded_at'   => $video->created_at->format('Y-m-d'),
                ];
            });

        // =========================================================

        return response()->json([
            'success' => true,
            'data' => [
                'employee_summary' => $employeeSummary,
                'videos_details'   => $videosDetails,
            ]
        ]);
    }
}
