<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Auth;
use App\Http\Resources\CommentResource;

class AnswerResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $userVote = null;
        if (Auth::check()) {
            $vote = $this->getUserVote(Auth::id());
            $userVote = $vote ? $vote->vote_type : null;
        }

        return [
            'id' => $this->id,
            'answer' => $this->answer,
            'upvotes_count' => $this->upvotes_count,
            'downvotes_count' => $this->downvotes_count,
            'is_helpful' => $this->is_helpful,
            'user_vote' => $userVote, // 'upvote', 'downvote', or null
            'can_be_edited' => $this->canBeEditedOrDeleted(),
            'created_at' => $this->created_at->toISOString(),
            'updated_at' => $this->updated_at->toISOString(),
            'user' => [
                'id' => $this->user->id,
                'name' => $this->user->name,
                'email' => $this->user->email,
                'role' => $this->user->role ?? null,
            ],
            'comments' => CommentResource::collection($this->whenLoaded('comments')),
        ];
    }
}
