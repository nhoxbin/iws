<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Answer extends Model
{
    use HasFactory;

    protected $fillable = ['post_id', 'user_id', 'answer', 'upvotes_count', 'downvotes_count', 'is_helpful'];

    protected $casts = [
        'upvotes_count' => 'integer',
        'downvotes_count' => 'integer',
        'is_helpful' => 'boolean',
    ];

    public function post()
    {
        return $this->belongsTo(Post::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function votes()
    {
        return $this->hasMany(AnswerVote::class);
    }

    public function upvotedByUsers()
    {
        return $this->belongsToMany(User::class, 'answer_votes')
            ->wherePivot('vote_type', 'upvote')
            ->withTimestamps();
    }

    public function downvotedByUsers()
    {
        return $this->belongsToMany(User::class, 'answer_votes')
            ->wherePivot('vote_type', 'downvote')
            ->withTimestamps();
    }

    public function getUserVote($userId)
    {
        return $this->votes()->where('user_id', $userId)->first();
    }

    public function comments()
    {
        return $this->hasMany(Comment::class)->whereNull('parent_id')->with('user', 'replies');
    }

    public function canBeEditedOrDeleted()
    {
        // Cannot edit/delete if it has been voted
        return $this->upvotes_count == 0 && $this->downvotes_count == 0;
    }

    public function hasBeenVoted()
    {
        return $this->upvotes_count > 0 || $this->downvotes_count > 0;
    }
}
