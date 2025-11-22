<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Answer extends Model
{
    use HasFactory;

    protected $fillable = ['post_id', 'user_id', 'answer', 'helpful_count'];

    protected $casts = [
        'helpful_count' => 'integer',
    ];

    public function post()
    {
        return $this->belongsTo(Post::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function helpfulByUsers()
    {
        return $this->belongsToMany(User::class, 'answer_helpful')->withTimestamps();
    }

    public function isMarkedHelpfulBy($userId)
    {
        return $this->helpfulByUsers()->where('user_id', $userId)->exists();
    }
}
