<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\PostResource;
use App\Models\Post;
use App\Models\Tag;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;

class PostController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:api')->except(['index', 'show']);
    }

    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $posts = Post::with(['user', 'tags'])->latest()->paginate(10);
        return PostResource::collection($posts);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $this->authorize('create', Post::class);

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'question' => 'required|string',
            'tags' => 'array',
            'tags.*' => 'string|max:255',
        ]);

        $post = Auth::user()->posts()->create([
            'title' => $validated['title'],
            'question' => $validated['question'],
        ]);

        $tags = [];
        foreach ($validated['tags'] as $tagName) {
            $tag = Tag::firstOrCreate(['name' => $tagName]);
            $tags[] = $tag->id;
        }
        $post->tags()->sync($tags);

        return new PostResource($post->load(['user', 'tags']));
    }

    /**
     * Display the specified resource.
     */
    public function show(Post $post)
    {
        return new PostResource($post->load(['user', 'tags']));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Post $post)
    {
        $this->authorize('update', $post);

        $validated = $request->validate([
            'title' => 'string|max:255',
            'question' => 'string',
            'tags' => 'array',
            'tags.*' => 'string|max:255',
        ]);

        $post->update($validated);

        if (isset($validated['tags'])) {
            $tags = [];
            foreach ($validated['tags'] as $tagName) {
                $tag = Tag::firstOrCreate(['name' => $tagName]);
                $tags[] = $tag->id;
            }
            $post->tags()->sync($tags);
        }

        return new PostResource($post->load(['user', 'tags']));
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Post $post)
    {
        $this->authorize('delete', $post);

        $post->delete();

        return response()->noContent();
    }

    public function save(Post $post)
    {
        Auth::user()->savedPosts()->toggle($post->id);

        return response()->json(['message' => 'Post saved status toggled.']);
    }

    public function savedPosts()
    {
        $savedPosts = Auth::user()->savedPosts()->with(['user', 'tags'])->latest()->paginate(10);
        return PostResource::collection($savedPosts);
    }
}
