<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Answer;
use App\Models\Comment;
use App\Models\Notification;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CommentController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:api');
    }

    /**
     * Store a new comment on an answer
     */
    public function store(Request $request, Answer $answer)
    {
        $validated = $request->validate([
            'content' => 'required|string|max:1000',
            'parent_id' => 'nullable|exists:comments,id',
            'tagged_user_id' => 'nullable|exists:users,id',
        ]);

        // If parent_id is provided, verify it belongs to the same answer
        if (isset($validated['parent_id'])) {
            $parentComment = Comment::findOrFail($validated['parent_id']);
            if ($parentComment->answer_id !== $answer->id) {
                return response()->json(['message' => 'Parent comment does not belong to this answer'], 422);
            }
        }

        $taggedUserId = $validated['tagged_user_id'] ?? null;

        $comment = $answer->comments()->create([
            'user_id' => Auth::id(),
            'content' => $validated['content'],
            'parent_id' => $validated['parent_id'] ?? null,
            'tagged_user_id' => $taggedUserId,
        ]);

        // Create notification for tagged user
        if ($taggedUserId && $taggedUserId != Auth::id()) {
            $currentUser = Auth::user();
            $post = $answer->post;

            Notification::create([
                'user_id' => $taggedUserId,
                'type' => 'comment_tagged',
                'message' => $currentUser->name . ' tagged you in a comment',
                'post_id' => $post->id,
                'related_user_id' => Auth::id(),
                'read' => false,
            ]);
        }

        return response()->json([
            'data' => $comment->load('user', 'taggedUser', 'replies')
        ], 201);
    }

    /**
     * Update a comment
     */
    public function update(Request $request, Comment $comment)
    {
        if ($comment->user_id !== Auth::id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'content' => 'required|string|max:1000',
        ]);

        $comment->update($validated);

        return response()->json([
            'data' => $comment->load('user', 'replies')
        ]);
    }

    /**
     * Delete a comment
     */
    public function destroy(Comment $comment)
    {
        if ($comment->user_id !== Auth::id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $comment->delete();

        return response()->noContent();
    }
}
