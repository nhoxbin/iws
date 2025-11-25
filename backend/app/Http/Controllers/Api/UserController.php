<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;

class UserController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:api')->except(['show']);
    }

    /**
     * Get user profile by ID
     */
    public function show($id)
    {
        $user = User::findOrFail($id);

        // Get user's posts
        $posts = $user->posts()
            ->withCount('answers')
            ->latest()
            ->take(10)
            ->get(['id', 'title', 'slug', 'created_at', 'user_id']);

        // Get user's answers with post information
        $answers = $user->answers()
            ->with(['post:id,title,slug'])
            ->latest()
            ->take(10)
            ->get();

        // Calculate stats
        $questionsCount = $user->posts()->count();
        $answersCount = $user->answers()->count();
        $helpfulMarksCount = $user->answers()->sum('upvotes_count');

        return response()->json([
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'created_at' => $user->created_at,
            ],
            'stats' => [
                'questionsCount' => $questionsCount,
                'answersCount' => $answersCount,
                'helpfulMarksCount' => $helpfulMarksCount,
            ],
            'recentActivity' => [
                'posts' => $posts,
                'answers' => $answers,
            ],
        ]);
    }

    /**
     * Search users by name or email
     */
    public function search(Request $request)
    {
        $query = $request->input('q', '');

        if (strlen($query) < 2) {
            return response()->json(['data' => []]);
        }

        $users = User::where('name', 'LIKE', "%{$query}%")
            ->orWhere('email', 'LIKE', "%{$query}%")
            ->select('id', 'name', 'email', 'role')
            ->limit(10)
            ->get();

        return response()->json(['data' => $users]);
    }
}
