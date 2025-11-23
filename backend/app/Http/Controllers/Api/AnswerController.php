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

        // Check if answer has been voted
        if ($answer->hasBeenVoted()) {
            return response()->json([
                'message' => 'Cannot edit answer that has been voted on'
            ], 422);
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

        // Check if answer has been voted
        if ($answer->hasBeenVoted()) {
            return response()->json([
                'message' => 'Cannot delete answer that has been voted on'
            ], 422);
        }

        $answer->delete();

        return response()->noContent();
    }

    /**
     * Vote on an answer (upvote or downvote).
     */
    public function vote(Request $request, Answer $answer)
    {
        $validated = $request->validate([
            'vote_type' => 'required|in:upvote,downvote',
        ]);

        $userId = Auth::id();
        $voteType = $validated['vote_type'];

        $existingVote = $answer->getUserVote($userId);

        if ($existingVote) {
            if ($existingVote->vote_type === $voteType) {
                // Remove vote if clicking the same vote type
                $existingVote->delete();
                $answer->decrement($voteType === 'upvote' ? 'upvotes_count' : 'downvotes_count');
            } else {
                // Switch vote type
                $answer->decrement($existingVote->vote_type === 'upvote' ? 'upvotes_count' : 'downvotes_count');
                $existingVote->update(['vote_type' => $voteType]);
                $answer->increment($voteType === 'upvote' ? 'upvotes_count' : 'downvotes_count');
            }
        } else {
            // Add new vote
            $answer->votes()->create([
                'user_id' => $userId,
                'vote_type' => $voteType,
            ]);
            $answer->increment($voteType === 'upvote' ? 'upvotes_count' : 'downvotes_count');
        }

        $answer->refresh();

        return new AnswerResource($answer->load('user'));
    }

    /**
     * Mark an answer as helpful (only post owner can do this).
     */
    public function markHelpful(Answer $answer)
    {
        $post = $answer->post;

        // Only post owner can mark answers as helpful
        if ($post->user_id !== Auth::id()) {
            return response()->json(['message' => 'Unauthorized. Only post owner can mark answers as helpful.'], 403);
        }

        // Toggle is_helpful
        $answer->is_helpful = !$answer->is_helpful;
        $answer->save();

        // Update post's is_resolved status based on whether any answer is marked helpful
        $hasHelpfulAnswer = $post->answers()->where('is_helpful', true)->exists();
        $post->is_resolved = $hasHelpfulAnswer;
        $post->save();

        $answer->refresh();

        return new AnswerResource($answer->load('user'));
    }
}
