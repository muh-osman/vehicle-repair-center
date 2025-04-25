<?php

namespace App\Http\Controllers;

use App\Models\MarketingPost;
use Illuminate\Http\Request;

use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;


class MarketingPostController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $posts = MarketingPost::latest()->get()
            ->map(function ($post) {
                $post->image_url = asset('images/' . $post->image);
                return $post;
            });

        return response()->json([
            'success' => true,
            'data' => $posts
        ]);
    }

    /**
     * Display a listing of the resource with embedded images
     * Get all marketing posts (return images as file)
     *
     */
    public function indexWithImages()
    {
        $posts = MarketingPost::latest()->get()->map(function ($post) {
            $imagePath = public_path('images/' . $post->image);

            // Set the image_url property first
            $post->image_url = asset('images/' . $post->image);

            if (file_exists($imagePath)) {
                $imageData = base64_encode(file_get_contents($imagePath));
                $mimeType = mime_content_type($imagePath);
                $post->image_data = "data:$mimeType;base64,$imageData";
            } else {
                $post->image_data = null;
            }

            // Remove the original image filename if you don't want it
            unset($post->image);

            return $post;
        });

        return response()->json([
            'success' => true,
            'data' => $posts
        ])->header('Access-Control-Allow-Origin', '*')
            ->header('Access-Control-Allow-Methods', 'GET, OPTIONS')
            ->header('Access-Control-Allow-Headers', 'Content-Type');
    }


    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'image' => 'required|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        $file = $request->file('image');
        $filename = Str::uuid() . '.' . $file->getClientOriginalExtension();

        // Save to public/images
        $file->move(public_path('images'), $filename);

        // Store only the filename in the database
        $post = MarketingPost::create([
            'title' => $validated['title'],
            'image' => $filename // Stores just the filename (e.g. "abc123.jpg")
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Post created successfully',
            'data' => [
                'post' => $post,
                'image_url' => asset('images/' . $filename) // Full URL
            ]
        ], 201);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        $post = MarketingPost::findOrFail($id);

        // Delete the associated image
        if (file_exists(public_path('images/' . $post->image))) {
            unlink(public_path('images/' . $post->image));
        }

        $post->delete();

        return response()->json(['success' => true]);
    }
}
