<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\AnswerResource;
use App\Models\Answer;
use App\Models\Post;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AnswerController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:api');
    }

    /**
     * Store a newly created answer for a post.
     */
    public function store(Request $request, Post $post)
    {
        $validated = $request->validate([
            'answer' => 'required|string',
        ]);

        $answer = $post->answers()->create([
            'user_id' => Auth::id(),
            'answer' => $validated['answer'],
        ]);

        return new AnswerResource($answer->load('user'));
    }

    /**
     * Update the specified answer.
     */
    public function update(Request $request, Answer $answer)
    {
        if ($answer->user_id !== Auth::id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'answer' => 'required|string',
        ]);

        $answer->update($validated);

        return new AnswerResource($answer->load('user'));
    }

    /**
     * Remove the specified answer.
     */
    public function destroy(Answer $answer)
    {
        if ($answer->user_id !== Auth::id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $answer->delete();

        return response()->noContent();
    }

    /**
     * Toggle helpful status for an answer.
     */
    public function toggleHelpful(Answer $answer)
    {
        $userId = Auth::id();

        if ($answer->helpfulByUsers()->where('user_id', $userId)->exists()) {
            $answer->helpfulByUsers()->detach($userId);
            $answer->decrement('helpful_count');
        } else {
            $answer->helpfulByUsers()->attach($userId);
            $answer->increment('helpful_count');
        }

        $answer->refresh();

        return new AnswerResource($answer->load('user'));
    }
}
