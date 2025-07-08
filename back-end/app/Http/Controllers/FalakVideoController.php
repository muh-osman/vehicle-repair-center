<?php

namespace App\Http\Controllers;

use App\Models\FalakVideo;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;


class FalakVideoController extends Controller
{

    /**
     * Display a listing of the videos.
     */
    public function index()
    {
        $videos = FalakVideo::latest()->get()
            ->map(function ($video) {
                $video->video_url = asset('falak-videos/' . $video->video_file_path);
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
            $videoFile = $request->file('video_file');
            $filename = Str::uuid() . '.' . $videoFile->getClientOriginalExtension();

            $videoFile->move(public_path('falak-videos'), $filename);

            $video = FalakVideo::create([
                'video_file_path' => $filename,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Video created successfully',
                'data' => [
                    'video' => $video,
                    'video_url' => asset('falak-videos/' . $filename)
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
        $video = FalakVideo::find($id);

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
        $video = FalakVideo::find($id);

        if (!$video) {
            return response()->json([
                'success' => false,
                'message' => 'Video not found'
            ], 404);
        }

        try {
            $filePath = public_path('falak-videos/' . $video->video_file_path);
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

    public function download($id)
    {
        $video = FalakVideo::findOrFail($id);
        $filePath = public_path('falak-videos/' . $video->video_file_path);

        // Check if file exists
        if (!file_exists($filePath)) {
            return response()->json([
                'success' => false,
                'message' => 'Video file not found'
            ], 404);
        }

        // Use the current stored filename for download
        $downloadName = $video->video_file_path;

        // Download with proper headers
        return response()->download($filePath, $downloadName, [
            'Content-Type' => 'video/mp4',
        ]);
    }
}
