<?php

namespace App\Http\Controllers;

use App\Models\Report;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class ReportController extends Controller
{
    /**
     * Display a listing of the reports.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function index()
    {
        $reports = Report::latest()->get()
            ->map(function ($report) {
                $report->pdf_url = asset('reports/' . $report->pdf_file_path); // Add full URL for the PDF
                return $report;
            });

        return response()->json([
            'success' => true,
            'data' => $reports
        ]);
    }

    /**
     * Store a newly created report in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'report_number' => 'required|string|max:255|unique:reports,report_number',
            'pdf_file' => 'required|file|mimes:pdf|max:10240', // 10MB max
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            // Get the user-provided report number
            $reportNumber = $request->input('report_number');

            // Upload the PDF file
            $pdfFile = $request->file('pdf_file');
            $filename = Str::uuid() . '.' . $pdfFile->getClientOriginalExtension(); // Use UUID for unique filename

            // Save to public/reports
            $pdfFile->move(public_path('reports'), $filename);

            // Create the report record
            $report = Report::create([
                'report_number' => $reportNumber,
                'pdf_file_path' => $filename, // Store just the filename
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Report created successfully',
                'data' => [
                    'report' => $report,
                    'pdf_url' => asset('reports/' . $filename) // Full URL to the PDF
                ]
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create report',
                'error' => $e->getMessage()
            ], 500);
        }
    }


    /**
     * Display the specified report.
     *
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function show($id)
    {
        $report = Report::find($id);

        if (!$report) {
            return response()->json([
                'success' => false,
                'message' => 'Report not found'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $report
        ]);
    }


    /**
     * Remove the specified report from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy($id)
    {
        $report = Report::find($id);

        if (!$report) {
            return response()->json([
                'success' => false,
                'message' => 'Report not found'
            ], 404);
        }

        try {
            // Delete the PDF file from storage
            $filePath = public_path('reports/' . $report->pdf_file_path);
            if (file_exists($filePath)) {
                unlink($filePath);
            }

            // Delete the report record from database
            $report->delete();

            return response()->json([
                'success' => true,
                'message' => 'Report deleted successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete report',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Find a report by report number.
     *
     * @param  string  $reportNumber
     * @return \Illuminate\Http\JsonResponse
     */
    public function findByReportNumber(string $reportNumber)
    {
        $report = Report::where('report_number', $reportNumber)->first();

        if (!$report) {
            return response()->json([
                'success' => false,
                'message' => 'Report not found'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $report
        ]);
    }


    /**
     * Download the report PDF file by report number.
     *
     * @param  string  $reportNumber
     * @return \Illuminate\Http\Response|\Illuminate\Http\JsonResponse
     */
    public function downloadSummaryReport($reportNumber)
    {
        $report = Report::where('report_number', $reportNumber)->first();

        if (!$report) {
            return response()->json([
                'success' => false,
                'message' => 'Report not found'
            ], 404);
        }

        $filePath = public_path('reports/' . $report->pdf_file_path);

        if (!file_exists($filePath)) {
            return response()->json([
                'success' => false,
                'message' => 'PDF file not found'
            ], 404);
        }

        // Default behavior - return file download
        $downloadFilename = $report->report_number . '.pdf';

        return response()->download($filePath, $downloadFilename, [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => 'attachment; filename="' . $downloadFilename . '"',
        ]);
    }

    /**
     * Return an array of all report numbers.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function showArrayOfSummaryReportsNumbers()
    {
        $reportNumbers = Report::pluck('report_number')->toArray();

        return response()->json([
            'success' => true,
            'data' => $reportNumbers
        ]);
    }
}
