'use client';

import { Home, Bookmark } from 'lucide-react';
import Link from 'next/link';
import PrivateRoute from '@/components/private-route';
import { AppHeader } from '@/components/app-header';

function SavedPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <AppHeader />

      {/* Main Content */}
      <main className="md:ml-20 mt-14 md:mt-16 pt-4 pb-20 md:pb-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-3">
              <Bookmark className="w-8 h-8" />
              Saved Questions
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              Questions you&apos;ve bookmarked for later reference.
            </p>
          </div>

          {/* Empty State */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-12 text-center">
            <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Bookmark className="w-10 h-10 text-slate-400" />
            </div>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
              No saved questions yet
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              Start bookmarking questions to access them quickly later
            </p>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition"
            >
              <Home className="w-4 h-4" />
              Browse Questions
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function Saved() {
  return (
    <PrivateRoute>
      <SavedPage />
    </PrivateRoute>
  );
}
