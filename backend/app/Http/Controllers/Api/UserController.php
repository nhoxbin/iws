<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;

class UserController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:api')->except(['show', 'leaderboard', 'topContributors']);
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

    /**
     * Get top contributors based on answer count
     */
    public function topContributors(Request $request)
    {
        $limit = $request->input('limit', 10);

        $contributors = User::withCount('answers')
            ->having('answers_count', '>', 0)
            ->orderBy('answers_count', 'desc')
            ->limit($limit)
            ->get(['id', 'name', 'email']);

        return response()->json([
            'data' => $contributors->map(function ($user) {
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'answers_count' => $user->answers_count,
                ];
            })
        ]);
    }

    /**
     * Get leaderboard with filters
     */
    public function leaderboard(Request $request)
    {
        $limit = $request->input('limit', 10);
        $timeRange = $request->input('time_range', 'all'); // all, monthly, weekly
        $categoryId = $request->input('category_id', null);
        $currentUserId = auth('api')->id();

        // Base query - calculate reputation from answers and upvotes
        $query = User::selectRaw('users.id, users.name, users.email, users.role,
                COUNT(DISTINCT answers.id) as answers_count,
                COALESCE(SUM(answers.upvotes_count), 0) as total_upvotes,
                (COUNT(DISTINCT answers.id) * 10 + COALESCE(SUM(answers.upvotes_count), 0) * 5) as reputation')
            ->leftJoin('answers', 'users.id', '=', 'answers.user_id');

        // Apply time range filter
        if ($timeRange === 'weekly') {
            $query->where('answers.created_at', '>=', now()->subWeek());
        } elseif ($timeRange === 'monthly') {
            $query->where('answers.created_at', '>=', now()->subMonth());
        }

        // Apply category filter
        if ($categoryId) {
            $query->join('posts', 'answers.post_id', '=', 'posts.id')
                ->where('posts.category_id', $categoryId);
        }

        $query->groupBy('users.id', 'users.name', 'users.email', 'users.role')
            ->having('reputation', '>', 0)
            ->orderBy('reputation', 'desc');

        // Get top users
        $topUsers = $query->limit($limit)->get();

        // Get current user's rank if authenticated
        $currentUserRank = null;
        if ($currentUserId) {
            // Check if current user is in top list
            $userInTop = $topUsers->firstWhere('id', $currentUserId);

            if (!$userInTop) {
                // Calculate user's rank and reputation
                $userQuery = User::selectRaw('users.id, users.name, users.email, users.role,
                        COUNT(DISTINCT answers.id) as answers_count,
                        COALESCE(SUM(answers.upvotes_count), 0) as total_upvotes,
                        (COUNT(DISTINCT answers.id) * 10 + COALESCE(SUM(answers.upvotes_count), 0) * 5) as reputation')
                    ->leftJoin('answers', 'users.id', '=', 'answers.user_id')
                    ->where('users.id', $currentUserId);

                if ($timeRange === 'weekly') {
                    $userQuery->where('answers.created_at', '>=', now()->subWeek());
                } elseif ($timeRange === 'monthly') {
                    $userQuery->where('answers.created_at', '>=', now()->subMonth());
                }

                if ($categoryId) {
                    $userQuery->join('posts', 'answers.post_id', '=', 'posts.id')
                        ->where('posts.category_id', $categoryId);
                }

                $userQuery->groupBy('users.id', 'users.name', 'users.email', 'users.role');
                $userData = $userQuery->first();

                if ($userData) {
                    // Calculate rank
                    $rankQuery = User::selectRaw('COUNT(DISTINCT u2.id) + 1 as rank')
                        ->from('users as u1')
                        ->leftJoin('answers as a1', 'u1.id', '=', 'a1.user_id')
                        ->crossJoin('users as u2')
                        ->leftJoin('answers as a2', 'u2.id', '=', 'a2.user_id')
                        ->where('u1.id', $currentUserId)
                        ->whereRaw('(COUNT(DISTINCT a2.id) * 10 + COALESCE(SUM(a2.upvotes_count), 0) * 5) > (COUNT(DISTINCT a1.id) * 10 + COALESCE(SUM(a1.upvotes_count), 0) * 5)');

                    if ($timeRange === 'weekly') {
                        $rankQuery->where('a1.created_at', '>=', now()->subWeek())
                            ->where('a2.created_at', '>=', now()->subWeek());
                    } elseif ($timeRange === 'monthly') {
                        $rankQuery->where('a1.created_at', '>=', now()->subMonth())
                            ->where('a2.created_at', '>=', now()->subMonth());
                    }

                    $currentUserRank = [
                        'rank' => $limit + 1, // Simplified: user is outside top 10
                        'user' => [
                            'id' => $userData->id,
                            'name' => $userData->name,
                            'role' => $userData->role,
                        ],
                        'reputation' => (int) $userData->reputation,
                        'answers_count' => (int) $userData->answers_count,
                        'is_in_top' => false,
                    ];
                }
            } else {
                $rank = $topUsers->search(function ($user) use ($currentUserId) {
                    return $user->id == $currentUserId;
                }) + 1;

                $currentUserRank = [
                    'rank' => $rank,
                    'user' => [
                        'id' => $userInTop->id,
                        'name' => $userInTop->name,
                        'role' => $userInTop->role,
                    ],
                    'reputation' => (int) $userInTop->reputation,
                    'answers_count' => (int) $userInTop->answers_count,
                    'is_in_top' => true,
                ];
            }
        }

        return response()->json([
            'data' => $topUsers->map(function ($user, $index) {
                return [
                    'rank' => $index + 1,
                    'id' => $user->id,
                    'name' => $user->name,
                    'role' => $user->role,
                    'reputation' => (int) $user->reputation,
                    'answers_count' => (int) $user->answers_count,
                    'total_upvotes' => (int) $user->total_upvotes,
                ];
            }),
            'current_user' => $currentUserRank,
        ]);
    }
}
