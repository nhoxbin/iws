'use client';

import { useState } from 'react';
import { useAuthStore } from '@/lib/auth-store';
import { Trophy, Medal, Award, ChevronLeft, ChevronRight } from 'lucide-react';
import PrivateRoute from '@/components/private-route';
import { AppHeader } from '@/components/app-header';

type Category = 'All' | 'Technology' | 'Science' | 'Arts' | 'Business';
type TimeRange = 'All Time' | 'Monthly' | 'Weekly';

interface LeaderUser {
  id: number;
  name: string;
  title: string;
  reputation: number;
  avatar?: string;
}

function LeaderboardPage() {
  const { user } = useAuthStore();
  const [selectedCategory, setSelectedCategory] = useState<Category>('All');
  const [selectedTimeRange, setSelectedTimeRange] = useState<TimeRange>('Weekly');
  const [currentPage, setCurrentPage] = useState(1);

  const categories: Category[] = ['All', 'Technology', 'Science', 'Arts', 'Business'];
  const timeRanges: TimeRange[] = ['All Time', 'Monthly', 'Weekly'];

  // Mock data
  const leaders: LeaderUser[] = [
    { id: 1, name: 'Olivia Martinez', title: 'Principal Designer @ Creative Co.', reputation: 15750 },
    { id: 2, name: 'Liam Garcia', title: 'Lead Data Scientist @ DataWorks', reputation: 14200 },
    { id: 3, name: 'Isabella Nguyen', title: 'Marketing Director @ Visionary Ads', reputation: 13980 },
    { id: 4, name: 'Noah Patel', title: 'CTO @ InnovateTech', reputation: 12500 },
    { id: 5, name: 'Sophia Kim', title: 'Senior Product Manager @ DevSolutions', reputation: 11830 },
  ];

  const currentUserRank = { rank: 42, reputation: 1280 };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <AppHeader showSearch={false} />

      {/* Main Content */}
      <main className="md:ml-20 mt-14 md:mt-16 pt-4 pb-20 md:pb-8 px-4 sm:px-6 lg:px-8">
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
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Time Range Filter */}
              <div className="flex-1">
                <div className="flex flex-wrap gap-2">
                  {timeRanges.map((range) => (
                    <button
                      key={range}
                      onClick={() => setSelectedTimeRange(range)}
                      className={`px-4 py-2 rounded-lg font-medium transition text-sm sm:text-base ${
                        selectedTimeRange === range
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      {range}
                    </button>
                  ))}
                </div>
              </div>

              {/* Category Filter */}
              <div className="flex-1">
                <div className="flex flex-wrap gap-2">
                  {categories.map((category) => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`px-4 py-2 rounded-lg font-medium transition text-sm sm:text-base ${
                        selectedCategory === category
                          ? 'bg-purple-600 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Current User Rank */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 mb-6 shadow-lg">
            <div className="flex items-center justify-between text-white">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur flex items-center justify-center text-3xl font-bold">
                  #{currentUserRank.rank}
                </div>
                <div>
                  <p className="text-sm opacity-90">You ({user?.name || 'Alex Chen'})</p>
                  <p className="text-xl font-bold">{user?.role ? `${user.role.charAt(0).toUpperCase()}${user.role.slice(1)} Software Engineer` : 'Senior Software Engineer'} @ Acme Inc.</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold">{currentUserRank.reputation.toLocaleString()}</p>
                <p className="text-sm opacity-90">REPUTATION</p>
              </div>
            </div>
          </div>

          {/* Leaderboard Table */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800">
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-white">
                      Rank
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-white">
                      User
                    </th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-slate-900 dark:text-white">
                      Reputation Score
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {leaders.map((leader, index) => (
                    <tr
                      key={leader.id}
                      className="border-b border-slate-100 dark:border-slate-800 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {index === 0 && <Trophy className="w-6 h-6 text-yellow-500" />}
                          {index === 1 && <Medal className="w-6 h-6 text-slate-400" />}
                          {index === 2 && <Award className="w-6 h-6 text-orange-600" />}
                          <span className="text-lg font-bold text-slate-900 dark:text-white">
                            {index + 1}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-900 dark:text-white font-semibold">
                            {leader.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900 dark:text-white">
                              {leader.name}
                            </p>
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                              {leader.title}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="text-2xl font-bold text-slate-900 dark:text-white">
                          {leader.reputation.toLocaleString()}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="flex items-center gap-2 px-4 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Previous</span>
              </button>
              <span className="text-sm text-slate-600 dark:text-slate-400">
                Page {currentPage} of 12
              </span>
              <button
                onClick={() => setCurrentPage(currentPage + 1)}
                className="flex items-center gap-2 px-4 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
              >
                <span className="hidden sm:inline">Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function Leaderboard() {
  return (
    <PrivateRoute>
      <LeaderboardPage />
    </PrivateRoute>
  );
}
