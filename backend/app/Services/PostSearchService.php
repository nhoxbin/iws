<?php

namespace App\Services;

use App\Models\Post;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;

class PostSearchService
{
    /**
     * Apply search filters to the query
     */
    public function applyFilters(Builder $query, Request $request): Builder
    {
        // Search by title or question content
        if ($request->has('search') && $request->search) {
            $searchTerm = $request->search;
            $query->where(function ($q) use ($searchTerm) {
                $q->where('title', 'like', "%{$searchTerm}%")
                    ->orWhere('question', 'like', "%{$searchTerm}%");
            });
        }

        // Filter by category
        if ($request->has('category') && $request->category) {
            $query->where('category_id', $request->category);
        }

        // Filter by tag
        if ($request->has('tag') && $request->tag) {
            $query->whereHas('tags', function ($q) use ($request) {
                $q->where('tags.id', $request->tag);
            });
        }

        return $query;
    }

    /**
     * Apply sorting to the query
     */
    public function applySorting(Builder $query, Request $request): Builder
    {
        $sortBy = $request->get('sort', 'latest');

        switch ($sortBy) {
            case 'unanswered':
                $query->doesntHave('answers');
                break;
            case 'latest':
            default:
                $query->latest();
                break;
        }

        return $query;
    }

    /**
     * Get filtered and sorted posts
     */
    public function search(Request $request, int $perPage = 10)
    {
        $query = Post::with(['user', 'tags', 'category']);

        $query = $this->applyFilters($query, $request);
        $query = $this->applySorting($query, $request);

        return $query->paginate($perPage);
    }
}
