'use client';

import { useState } from 'react';
import { useAuthStore } from '@/lib/auth-store';
import { Trophy, Medal, Award } from 'lucide-react';
import { useCategories, useLeaderboard } from '@/hooks/use-cached-data';

interface Category {
  id: number;
  name: string;
}

interface Leader {
  rank: number;
  id: number;
  name: string;
  role: string | null;
  reputation: number;
  answers_count: number;
  total_upvotes: number;
}

function LeaderboardPage() {
  const { user } = useAuthStore();
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedTimeRange, setSelectedTimeRange] = useState<string>('weekly');

  const timeRanges = [
    { value: 'all', label: 'All Time' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'weekly', label: 'Weekly' },
  ];

  // Use SWR cached hooks
  const { categories } = useCategories();
  const { leaders, currentUserRank, isLoading: loading } = useLeaderboard(
    selectedTimeRange,
    selectedCategory,
    10
  );

  return (
    <div className="pt-4 pb-20 md:pb-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-3">
              Leaderboard
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              See who&apos;s making the biggest impact in our community.
            </p>
          </div>

          {/* Filters */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-4 sm:p-6 mb-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Time Range Filter */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Time Range
                </label>
                <select
                  value={selectedTimeRange}
                  onChange={(e) => setSelectedTimeRange(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {timeRanges.map((range) => (
                    <option key={range.value} value={range.value}>
                      {range.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Category Filter */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Category
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">All Categories</option>
                  {categories.map((category: Category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Current User Rank */}
          {currentUserRank && (
            <div className="bg-linear-to-r from-blue-600 to-purple-600 rounded-2xl p-6 mb-6 shadow-lg">
              <div className="flex flex-col sm:flex-row items-center justify-between text-white gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur flex items-center justify-center text-3xl font-bold">
                    {currentUserRank.is_in_top ? `#${currentUserRank.rank}` : '10+'}
                  </div>
                  <div>
                    <p className="text-sm opacity-90">You ({currentUserRank.user.name})</p>
                    <p className="text-lg sm:text-xl font-bold">
                      {currentUserRank.user.role
                        ? `${currentUserRank.user.role.charAt(0).toUpperCase()}${currentUserRank.user.role.slice(1)}`
                        : 'Community Member'}
                    </p>
                    {!currentUserRank.is_in_top && (
                      <p className="text-xs opacity-75">Rank: #{currentUserRank.rank}</p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold">{currentUserRank.reputation.toLocaleString()}</p>
                  <p className="text-sm opacity-90">REPUTATION</p>
                  <p className="text-xs opacity-75">{currentUserRank.answers_count} Answers</p>
                </div>
              </div>
            </div>
          )}

          {/* Leaderboard Table */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            {loading ? (
              <div className="p-12 text-center">
                <div className="animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-slate-600 dark:text-slate-400">Loading leaderboard...</p>
              </div>
            ) : leaders.length === 0 ? (
              <div className="p-12 text-center">
                <Trophy className="w-16 h-16 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                  No data yet
                </h3>
                <p className="text-slate-600 dark:text-slate-400">
                  Be the first to earn reputation by answering questions!
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800">
                      <th className="px-4 sm:px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-white">
                        Rank
                      </th>
                      <th className="px-4 sm:px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-white">
                        User
                      </th>
                      <th className="px-4 sm:px-6 py-4 text-right text-sm font-semibold text-slate-900 dark:text-white">
                        Reputation
                      </th>
                      <th className="px-4 sm:px-6 py-4 text-right text-sm font-semibold text-slate-900 dark:text-white hidden sm:table-cell">
                        Answers
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaders.map((leader: Leader) => {
                      const isCurrentUser = user && leader.id === Number(user.id);
                      return (
                        <tr
                          key={leader.id}
                          className={`border-b border-slate-100 dark:border-slate-800 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition ${
                            isCurrentUser ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                          }`}
                        >
                          <td className="px-4 sm:px-6 py-4">
                            <div className="flex items-center gap-2">
                              {leader.rank === 1 && <Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-500" />}
                              {leader.rank === 2 && <Medal className="w-5 h-5 sm:w-6 sm:h-6 text-slate-400" />}
                              {leader.rank === 3 && <Award className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600" />}
                              <span className="text-lg font-bold text-slate-900 dark:text-white">
                                {leader.rank}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 sm:px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm">
                                {leader.name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <p className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                                  {leader.name}
                                  {isCurrentUser && (
                                    <span className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded">You</span>
                                  )}
                                </p>
                                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                                  {leader.role || 'Community Member'}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 sm:px-6 py-4 text-right">
                            <span className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                              {leader.reputation.toLocaleString()}
                            </span>
                            <p className="text-xs text-slate-500 dark:text-slate-400 sm:hidden">
                              {leader.answers_count} answers
                            </p>
                          </td>
                          <td className="px-4 sm:px-6 py-4 text-right hidden sm:table-cell">
                            <span className="text-lg font-semibold text-slate-700 dark:text-slate-300">
                              {leader.answers_count}
                            </span>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                              {leader.total_upvotes} upvotes
                            </p>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
      </div>
    </div>
  );
}

export default function Leaderboard() {
  return <LeaderboardPage />;
}
