<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\PostResource;
use App\Models\Answer;
use App\Models\Post;
use App\Models\Tag;
use App\Services\PostSearchService;
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
    public function index(Request $request, PostSearchService $searchService)
    {
        $posts = $searchService->search($request);
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
            'tags.*.name' => 'required|string|max:255',
            'category_id' => 'nullable|numeric|exists:categories,id',
        ]);

        $post = Auth::user()->posts()->create([
            'title' => $validated['title'],
            'question' => $validated['question'],
            'category_id' => $validated['category_id'],
        ]);

        $tags = [];
        if (isset($validated['tags'])) {
            foreach ($validated['tags'] as $tagData) {
                $tag = Tag::firstOrCreate(['name' => $tagData['name']]);
                $tags[] = $tag->id;
            }
        }
        $post->tags()->sync($tags);

        return new PostResource($post->load(['user', 'tags', 'category']));
    }

    /**
     * Display the specified resource.
     */
    public function show(Post $post)
    {
        return new PostResource($post->load(['user', 'tags', 'category', 'answers.user', 'answers.comments.user', 'answers.comments.replies']));
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
            'tags.*.name' => 'required|string|max:255',
            'category_id' => 'nullable|numeric|exists:categories,id',
        ]);

        $post->update($validated);

        if (isset($validated['tags'])) {
            $tags = [];
            foreach ($validated['tags'] as $tagData) {
                $tag = Tag::firstOrCreate(['name' => $tagData['name']]);
                $tags[] = $tag->id;
            }
            $post->tags()->sync($tags);
        }

        return new PostResource($post->load(['user', 'tags', 'category']));
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

    /**
     * Vote on a post (upvote or downvote)
     */
    public function vote(Request $request, Post $post)
    {
        $validated = $request->validate([
            'vote_type' => 'required|in:upvote,downvote',
        ]);

        $userId = Auth::id();
        $voteType = $validated['vote_type'];

        // Check if user already voted
        $existingVote = $post->votes()->where('user_id', $userId)->first();

        if ($existingVote) {
            if ($existingVote->vote_type === $voteType) {
                // Remove vote if clicking the same button
                $existingVote->delete();

                if ($voteType === 'upvote') {
                    $post->decrement('upvotes_count');
                } else {
                    $post->decrement('downvotes_count');
                }
            } else {
                // Change vote type
                $oldVoteType = $existingVote->vote_type;
                $existingVote->update(['vote_type' => $voteType]);

                if ($oldVoteType === 'upvote') {
                    $post->decrement('upvotes_count');
                    $post->increment('downvotes_count');
                } else {
                    $post->decrement('downvotes_count');
                    $post->increment('upvotes_count');
                }
            }
        } else {
            // Create new vote
            $post->votes()->create([
                'user_id' => $userId,
                'vote_type' => $voteType,
            ]);

            if ($voteType === 'upvote') {
                $post->increment('upvotes_count');
            } else {
                $post->increment('downvotes_count');
            }
        }

        $post->refresh();

        return response()->json([
            'message' => 'Vote recorded',
            'upvotes_count' => $post->upvotes_count,
            'downvotes_count' => $post->downvotes_count,
            'user_vote' => $post->getUserVote($userId)?->vote_type,
        ]);
    }
}
