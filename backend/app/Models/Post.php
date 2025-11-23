<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Post extends Model
{
    use HasFactory;

    protected $fillable = ['title', 'question', 'slug', 'user_id', 'category_id', 'views_count', 'is_resolved', 'upvotes_count', 'downvotes_count'];

    /**
     * Get the route key for the model.
     */
    public function getRouteKeyName()
    {
        return 'slug';
    }

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($post) {
            if (empty($post->slug)) {
                $post->slug = static::generateUniqueSlug($post->title);
            }
        });

        static::updating(function ($post) {
            if ($post->isDirty('title') && empty($post->slug)) {
                $post->slug = static::generateUniqueSlug($post->title);
            }
        });
    }

    protected static function generateUniqueSlug($title)
    {
        $slug = Str::slug($title);
        $originalSlug = $slug;
        $counter = 1;

        while (static::where('slug', $slug)->exists()) {
            $slug = $originalSlug . '-' . $counter;
            $counter++;
        }

        return $slug;
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function tags()
    {
        return $this->belongsToMany(Tag::class);
    }

    public function savedByUsers()
    {
        return $this->belongsToMany(User::class, 'saved_posts');
    }

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function answers()
    {
        return $this->hasMany(Answer::class);
    }

    public function votes()
    {
        return $this->hasMany(PostVote::class);
    }

    public function upvotedByUsers()
    {
        return $this->belongsToMany(User::class, 'post_votes')
            ->wherePivot('vote_type', 'upvote')
            ->withTimestamps();
    }

    public function downvotedByUsers()
    {
        return $this->belongsToMany(User::class, 'post_votes')
            ->wherePivot('vote_type', 'downvote')
            ->withTimestamps();
    }

    public function getUserVote($userId)
    {
        return $this->votes()->where('user_id', $userId)->first();
    }
}
