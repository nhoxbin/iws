<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Auth;

class AnswerResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $isHelpful = false;
        if (Auth::check()) {
            $isHelpful = $this->isMarkedHelpfulBy(Auth::id());
        }

        return [
            'id' => $this->id,
            'answer' => $this->answer,
            'helpful_count' => $this->helpful_count,
            'is_helpful' => $isHelpful,
            'created_at' => $this->created_at->toISOString(),
            'updated_at' => $this->updated_at->toISOString(),
            'user' => [
                'id' => $this->user->id,
                'name' => $this->user->name,
                'email' => $this->user->email,
                'role' => $this->user->role ?? null,
            ],
        ];
    }
}
