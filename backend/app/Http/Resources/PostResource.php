<?php

namespace App\Http\Resources;

use App\Http\Resources\AnswerResource;
use App\Http\Resources\CategoryResource;
use App\Http\Resources\TagResource;
use App\Http\Resources\UserResource;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PostResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $user = $request->user();

        return [
            'id' => $this->id,
            'slug' => $this->slug,
            'title' => $this->title,
            'question' => $this->question,
            'created_at' => $this->created_at->toDateTimeString(),
            'updated_at' => $this->updated_at->toDateTimeString(),
            'is_resolved' => $this->is_resolved,
            'answers_count' => $this->answers()->count(),
            'views_count' => $this->views_count ?? 0,
            'upvotes_count' => $this->upvotes_count ?? 0,
            'downvotes_count' => $this->downvotes_count ?? 0,
            'user_vote' => $user ? $this->getUserVote($user->id)?->vote_type : null,
            'is_saved' => $user ? $user->savedPosts()->where('post_id', $this->id)->exists() : false,
            'user' => new UserResource($this->whenLoaded('user')),
            'tags' => TagResource::collection($this->whenLoaded('tags')),
            'category' => new CategoryResource($this->whenLoaded('category')),
            'answers' => AnswerResource::collection($this->whenLoaded('answers')),
        ];
    }
}
