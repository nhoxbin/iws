'use client';

import { useAuthStore } from '@/lib/auth-store';
import PrivateRoute from '@/components/private-route';
import { AppHeader } from '@/components/app-header';

function DashboardPage() {
  const { user } = useAuthStore();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <AppHeader />

      {/* Main Content */}
      <main className="md:ml-20 mt-14 md:mt-16 pt-4 pb-20 md:pb-8 px-4 sm:px-6 lg:px-8">

        {/* Question Input */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 mb-8">
          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-white flex-shrink-0">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="flex-1">
              <input
                type="text"
                placeholder="'Behavioral'..."
                className="w-full bg-transparent text-white text-lg mb-4 focus:outline-none placeholder:text-slate-500"
              />
              <div className="flex gap-2 mb-4">
                <span className="px-3 py-1 bg-slate-700 text-slate-300 rounded-full text-sm">🏷️</span>
              </div>
              <div className="flex justify-end">
                <button className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition">
                  Submit
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6">
          <span className="text-white font-medium">Questions for you:</span>
          <button className="px-4 py-1 bg-blue-600 text-white rounded-full text-sm">
            Unanswered
          </button>
          <button className="px-4 py-1 text-slate-400 hover:text-white text-sm">
            By Topic
          </button>
          <button className="px-4 py-1 text-slate-400 hover:text-white text-sm">
            Latest
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Questions Feed */}
          <div className="lg:col-span-2 space-y-6">
            {/* Question Card */}
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
              <div className="flex gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-slate-700"></div>
                <div>
                  <h3 className="text-white font-semibold">Jane Doe</h3>
                  <span className="text-sm text-green-400">Junior</span>
                </div>
              </div>
              <h2 className="text-xl text-white font-semibold mb-3">
                How would you design a distributed caching system for a high-traffic e-commerce site?
              </h2>
              <p className="text-slate-400 mb-4 text-sm leading-relaxed">
                I&apos;m preparing for a senior backend role and need to understand the trade-offs between
                different caching strategies like write-through, write-back, and cache-aside. What are
                the key considerations for scalability and data consistency?
              </p>
              <div className="flex gap-2 mb-6">
                <span className="px-3 py-1 bg-slate-700 text-slate-300 rounded-md text-sm">
                  System Design
                </span>
                <span className="px-3 py-1 bg-slate-700 text-slate-300 rounded-md text-sm">
                  Caching
                </span>
                <span className="px-3 py-1 bg-slate-700 text-slate-300 rounded-md text-sm">
                  Scalability
                </span>
              </div>

              {/* Answer */}
              <div className="border-t border-slate-700 pt-6">
                <div className="flex gap-4 mb-4">
                  <div className="w-10 h-10 rounded-full bg-slate-700"></div>
                  <div>
                    <h4 className="text-white font-semibold">Alex Smith</h4>
                    <span className="text-sm text-blue-400">Senior</span>
                  </div>
                </div>
                <p className="text-slate-300 text-sm leading-relaxed mb-4">
                  For a high-traffic e-commerce site, a cache-aside (or lazy-loading) strategy is
                  often the best starting point. It provides a good balance between performance
                  and data consistency... The key is to use a distributed cache like Redis or
                  Memcached to handle the load and ensure replicas for high availability.
                </p>
                <div className="flex items-center gap-4">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4].map((i) => (
                      <span key={i} className="text-yellow-500">★</span>
                    ))}
                    <span className="text-slate-600">★</span>
                  </div>
                  <button className="text-sm text-slate-400 hover:text-white">
                    👍 Helpful
                  </button>
                  <button className="text-sm text-slate-400 hover:text-white">
                    👎 Not Helpful
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Tags */}
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
              <h3 className="text-white font-semibold mb-4">Popular Tags</h3>
              <div className="space-y-2">
                <div className="text-slate-300 text-sm">#SystemDesign</div>
                <div className="text-slate-300 text-sm">#DataStructures</div>
                <div className="text-slate-300 text-sm">#Behavioral</div>
                <div className="text-slate-300 text-sm">#Java</div>
                <div className="text-slate-300 text-sm">#ProductManagement</div>
              </div>
            </div>

            {/* Top Contributors */}
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
              <h3 className="text-white font-semibold mb-4">Top Contributors</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-700"></div>
                  <div className="flex-1">
                    <div className="text-white text-sm font-medium">Alex Smith</div>
                    <div className="text-slate-400 text-xs">128 Answers</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-700"></div>
                  <div className="flex-1">
                    <div className="text-white text-sm font-medium">Maria Garcia</div>
                    <div className="text-slate-400 text-xs">97 Answers</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-700"></div>
                  <div className="flex-1">
                    <div className="text-white text-sm font-medium">Ken Tanaka</div>
                    <div className="text-slate-400 text-xs">85 Answers</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function Dashboard() {
  return (
    <PrivateRoute>
      <DashboardPage />
    </PrivateRoute>
  );
}
