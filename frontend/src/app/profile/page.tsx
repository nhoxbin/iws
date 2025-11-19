'use client';

import { useAuthStore } from '@/lib/auth-store';
import { CheckCircle2, Clock, AtSign } from 'lucide-react';
import Link from 'next/link';
import PrivateRoute from '@/components/private-route';
import { AppHeader } from '@/components/app-header';

function ProfilePage() {
  const { user } = useAuthStore();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <AppHeader showSearch={false} />

      {/* Main Content */}
      <main className="md:ml-20 mt-14 md:mt-16 pt-4 pb-20 md:pb-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          {/* Profile Header */}
          <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 mb-6">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-6">
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-slate-700 to-slate-600 flex items-center justify-center">
                  <span className="text-white text-5xl font-bold">{user?.name?.charAt(0).toUpperCase() || 'A'}</span>
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white mb-2">{user?.name || 'Alex Doe'}</h1>
                  <p className="text-slate-400 text-lg">{user?.role ? `${user.role.charAt(0).toUpperCase()}${user.role.slice(1)} Developer` : 'Junior Developer'}</p>
                </div>
              </div>
              <Link href="/edit-profile">
                <button className="px-6 py-2 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition">
                  Edit Profile
                </button>
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {/* Current Level Card */}
            <div className="md:col-span-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Current Level: {user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'Junior'}</h2>
              <p className="text-slate-400 mb-6">
                Advance your career by updating your seniority level when you&apos;re ready.
              </p>
              <button className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition inline-flex items-center gap-2">
                Update Level
                <Clock className="w-4 h-4" />
              </button>
              <p className="text-slate-500 text-sm mt-3 flex items-center gap-2">
                <AtSign className="w-4 h-4" />
                You can update once every 6 months.
              </p>
            </div>

            {/* Questions Asked Card */}
            <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
              <h3 className="text-slate-400 mb-2">Questions Asked</h3>
              <div className="text-5xl font-bold text-white mb-2">28</div>
              <p className="text-slate-500 text-sm">+5 in the last 30 days</p>
            </div>
          </div>

          {/* Activity History */}
          <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
            <h2 className="text-xl font-semibold text-white mb-6">Activity History</h2>
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="flex-shrink-0 mt-1">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                </div>
                <div className="flex-1">
                  <h3 className="text-white font-medium mb-1">
                    How to handle state management in a large-scale React application?
                  </h3>
                  <p className="text-slate-400 text-sm">Answered 2 days ago</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 mt-1">
                  <Clock className="w-5 h-5 text-blue-500" />
                </div>
                <div className="flex-1">
                  <h3 className="text-white font-medium mb-1">
                    Best practices for REST API design and versioning.
                  </h3>
                  <p className="text-slate-400 text-sm">Awaiting answer · 5 days ago</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 mt-1">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                </div>
                <div className="flex-1">
                  <h3 className="text-white font-medium mb-1">
                    What are the core differences between SQL and NoSQL databases?
                  </h3>
                  <p className="text-slate-400 text-sm">Answered 1 week ago</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function Profile() {
  return (
    <PrivateRoute>
      <ProfilePage />
    </PrivateRoute>
  );
}
