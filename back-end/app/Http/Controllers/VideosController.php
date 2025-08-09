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
                $video->video_url_2 = $video->video_file_path_2 ? asset('videos/' . $video->video_file_path_2) : null;
                $video->video_url_3 = $video->video_file_path_3 ? asset('videos/' . $video->video_file_path_3) : null;
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
            'video_file' => 'required|file|mimetypes:video/*|max:102400', // 100MB max
            'video_file_2' => 'nullable|file|mimetypes:video/*|max:102400',
            'video_file_3' => 'nullable|file|mimetypes:video/*|max:102400',
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
            $videoData = [
                'report_number' => $reportNumber,
            ];

            // Process main video file
            $videoFile = $request->file('video_file');
            $filename = Str::uuid() . '.' . $videoFile->getClientOriginalExtension();
            $videoFile->move(public_path('videos'), $filename);
            $videoData['video_file_path'] = $filename;

            // Process second video file if exists
            if ($request->hasFile('video_file_2')) {
                $videoFile2 = $request->file('video_file_2');
                $filename2 = Str::uuid() . '.' . $videoFile2->getClientOriginalExtension();
                $videoFile2->move(public_path('videos'), $filename2);
                $videoData['video_file_path_2'] = $filename2;
            }

            // Process third video file if exists
            if ($request->hasFile('video_file_3')) {
                $videoFile3 = $request->file('video_file_3');
                $filename3 = Str::uuid() . '.' . $videoFile3->getClientOriginalExtension();
                $videoFile3->move(public_path('videos'), $filename3);
                $videoData['video_file_path_3'] = $filename3;
            }

            $video = Video::create($videoData);

            $responseData = [
                'video' => $video,
                'video_url' => asset('videos/' . $filename),
            ];

            if (isset($filename2)) {
                $responseData['video_url_2'] = asset('videos/' . $filename2);
            }
            if (isset($filename3)) {
                $responseData['video_url_3'] = asset('videos/' . $filename3);
            }

            return response()->json([
                'success' => true,
                'message' => 'Video(s) created successfully',
                'data' => $responseData
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create video(s)',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update the specified video in storage.
     */
    public function update(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'report_number' => 'required|string|max:255',
            'video_file_2' => 'nullable|file|mimetypes:video/*|max:102400',
            'video_file_3' => 'nullable|file|mimetypes:video/*|max:102400',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $reportNumber = $request->input('report_number');
        $video = Video::where('report_number', $reportNumber)->first();

        if (!$video) {
            return response()->json([
                'success' => false,
                'message' => 'Video not found'
            ], 404);
        }

        try {
            // Process second video file if exists
            if ($request->hasFile('video_file_2')) {
                $this->updateVideoFile($video, 'video_file_path_2', $request->file('video_file_2'));
            }

            // Process third video file if exists
            if ($request->hasFile('video_file_3')) {
                $this->updateVideoFile($video, 'video_file_path_3', $request->file('video_file_3'));
            }

            // Save the updated video record
            $video->save();

            // Prepare response data with updated URLs
            $responseData = [
                'video' => $video,
                'video_url' => asset('videos/' . $video->video_file_path),
                'video_url_2' => $video->video_file_path_2 ? asset('videos/' . $video->video_file_path_2) : null,
                'video_url_3' => $video->video_file_path_3 ? asset('videos/' . $video->video_file_path_3) : null,
            ];

            return response()->json([
                'success' => true,
                'message' => 'Video updated successfully',
                'data' => $responseData
            ]);
        } catch (\Exception $e) {
            // Log the error for debugging
            \Log::error('Failed to update video: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Failed to update video',
                'error' => 'An error occurred while updating the video.'
            ], 500);
        }
    }

    /**
     * Helper method to update video file.
     */
    private function updateVideoFile($video, $field, $newFile)
    {
        // Delete the old file if it exists
        if ($video->$field) {
            $oldFilePath = public_path('videos/' . $video->$field);
            if (file_exists($oldFilePath)) {
                unlink($oldFilePath);
            }
        }

        // Process the new file
        $filename = Str::uuid() . '.' . $newFile->getClientOriginalExtension();
        $newFile->move(public_path('videos'), $filename);
        $video->$field = $filename;
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

        $video->video_url = asset('videos/' . $video->video_file_path);
        $video->video_url_2 = $video->video_file_path_2 ? asset('videos/' . $video->video_file_path_2) : null;
        $video->video_url_3 = $video->video_file_path_3 ? asset('videos/' . $video->video_file_path_3) : null;

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
            // Delete all associated video files
            $files = [
                public_path('videos/' . $video->video_file_path),
                $video->video_file_path_2 ? public_path('videos/' . $video->video_file_path_2) : null,
                $video->video_file_path_3 ? public_path('videos/' . $video->video_file_path_3) : null,
            ];

            foreach ($files as $file) {
                if ($file && file_exists($file)) {
                    unlink($file);
                }
            }

            $video->delete();

            return response()->json([
                'success' => true,
                'message' => 'Video and all associated files deleted successfully'
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

        $video->video_url = asset('videos/' . $video->video_file_path);
        $video->video_url_2 = $video->video_file_path_2 ? asset('videos/' . $video->video_file_path_2) : null;
        $video->video_url_3 = $video->video_file_path_3 ? asset('videos/' . $video->video_file_path_3) : null;

        return response()->json([
            'success' => true,
            'data' => $video
        ]);
    }

    /**
     * Download the video file by report number.
     */
    public function downloadVideo($reportNumber, $fileNumber)
    {
        $video = Video::where('report_number', $reportNumber)->first();

        if (!$video) {
            return response()->json([
                'success' => false,
                'message' => 'Video not found'
            ], 404);
        }

        // Determine which file to download
        $filePath = null;
        $filename = null;

        switch ($fileNumber) {
            case 1:
                if ($video->video_file_path) {
                    $filePath = public_path('videos/' . $video->video_file_path);
                    $filename = $reportNumber . '_1.' . pathinfo($video->video_file_path, PATHINFO_EXTENSION);
                }
                break;
            case 2:
                if ($video->video_file_path_2) {
                    $filePath = public_path('videos/' . $video->video_file_path_2);
                    $filename = $reportNumber . '_2.' . pathinfo($video->video_file_path_2, PATHINFO_EXTENSION);
                }
                break;
            case 3:
                if ($video->video_file_path_3) {
                    $filePath = public_path('videos/' . $video->video_file_path_3);
                    $filename = $reportNumber . '_3.' . pathinfo($video->video_file_path_3, PATHINFO_EXTENSION);
                }
                break;
        }

        if (!$filePath || !file_exists($filePath)) {
            return response()->json([
                'success' => false,
                'message' => 'Video file not found'
            ], 404);
        }

        // Set proper headers for download
        $headers = [
            'Content-Type' => 'video/' . pathinfo($filePath, PATHINFO_EXTENSION),
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
            'Content-Length' => filesize($filePath),
            'Cache-Control' => 'must-revalidate',
            'Pragma' => 'public',
        ];

        return response()->download($filePath, $filename, $headers);
    }

    /**
     * This method unused.
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

    /**
     * Check which card IDs have video reports.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function checkIfCardsHaveVideos(Request $request)
    {
        // Validate the request contains a card_ids array
        $validator = Validator::make($request->all(), [
            'card_ids' => 'required|array',
            'card_ids.*' => 'integer' // Ensure each ID is an integer
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $cardIds = $request->input('card_ids');

        // Get all video report numbers that match the card IDs
        $existingVideos = Video::whereIn('report_number', $cardIds)
            ->pluck('report_number')
            ->toArray();

        // Create a response showing which cards have videos
        $response = [];
        foreach ($cardIds as $cardId) {
            $response[$cardId] = in_array($cardId, $existingVideos);
        }

        return response()->json([
            'success' => true,
            'data' => $response
        ]);
    }
}
