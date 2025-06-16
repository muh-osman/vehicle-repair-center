<?php

namespace App\Http\Controllers;

use App\Models\Video;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class VideosController extends Controller
{

    /**
     * Display a listing of the videos.
     */
    public function index()
    {
        $videos = Video::latest()->get()
            ->map(function ($video) {
                $video->video_url = asset('videos/' . $video->video_file_path);
                return $video;
            });

        return response()->json([
            'success' => true,
            'data' => $videos
        ]);
    }



    /**
     * Store a newly created video in storage.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'report_number' => 'required|string|max:255|unique:videos,report_number',
            'video_file' => 'required|file|mimes:mp4,mov,avi|max:51200', // 50MB max
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $reportNumber = $request->input('report_number');
            $videoFile = $request->file('video_file');
            $filename = Str::uuid() . '.' . $videoFile->getClientOriginalExtension();

            $videoFile->move(public_path('videos'), $filename);

            $video = Video::create([
                'report_number' => $reportNumber,
                'video_file_path' => $filename,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Video created successfully',
                'data' => [
                    'video' => $video,
                    'video_url' => asset('videos/' . $filename)
                ]
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create video',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified video.
     */
    public function show($id)
    {
        $video = Video::find($id);

        if (!$video) {
            return response()->json([
                'success' => false,
                'message' => 'Video not found'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $video
        ]);
    }


    /**
     * Remove the specified video from storage.
     */
    public function destroy($id)
    {
        $video = Video::find($id);

        if (!$video) {
            return response()->json([
                'success' => false,
                'message' => 'Video not found'
            ], 404);
        }

        try {
            $filePath = public_path('videos/' . $video->video_file_path);
            if (file_exists($filePath)) {
                unlink($filePath);
            }

            $video->delete();

            return response()->json([
                'success' => true,
                'message' => 'Video deleted successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete video',
                'error' => $e->getMessage()
            ], 500);
        }
    }


    /**
     * Find a video by report number.
     */
    public function findByReportNumber(string $reportNumber)
    {
        $video = Video::where('report_number', $reportNumber)->first();

        if (!$video) {
            return response()->json([
                'success' => false,
                'message' => 'Video not found'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $video
        ]);
    }

    /**
     * Download the video file by report number.
     */
    public function downloadVideo($reportNumber)
    {
        $video = Video::where('report_number', $reportNumber)->first();

        if (!$video) {
            return response()->json([
                'success' => false,
                'message' => 'Video not found'
            ], 404);
        }

        $filePath = public_path('videos/' . $video->video_file_path);

        if (!file_exists($filePath)) {
            return response()->json([
                'success' => false,
                'message' => 'Video file not found'
            ], 404);
        }

        $downloadFilename = $video->report_number . '.' . pathinfo($video->video_file_path, PATHINFO_EXTENSION);

        return response()->download($filePath, $downloadFilename, [
            'Content-Type' => 'video/' . pathinfo($video->video_file_path, PATHINFO_EXTENSION),
            'Content-Disposition' => 'attachment; filename="' . $downloadFilename . '"',
        ]);
    }

    /**
     * Return an array of all video report numbers.
     */
    public function showArrayOfVideoReportNumbers()
    {
        $reportNumbers = Video::pluck('report_number')->toArray();

        return response()->json([
            'success' => true,
            'data' => $reportNumbers
        ]);
    }
}
