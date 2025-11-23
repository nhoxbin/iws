'use client';

import { useEffect, useState } from 'react';
import { Bookmark, Home, Clock, Eye, MessageSquare, X } from 'lucide-react';
import { Link } from '@/lib/navigation';
import PrivateRoute from '@/components/private-route';
import api from '@/lib/api';
import { formatDate } from '@/lib/date-utils';

interface Tag {
  id: number;
  name: string;
}

interface Category {
  id: number;
  name: string;
}

interface User {
  id: number;
  name: string;
  email: string;
}

interface Question {
  id: number;
  slug: string;
  title: string;
  question: string;
  created_at: string;
  updated_at: string;
  user: User;
  tags: Tag[];
  category?: Category;
  answers_count?: number;
  views_count?: number;
}

interface PaginationMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

function SavedPage() {
  const [savedQuestions, setSavedQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchSavedQuestions(currentPage);
  }, [currentPage]);

  const fetchSavedQuestions = async (page: number) => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.get(`/saved-posts?page=${page}`);
      setSavedQuestions(response.data.data);
      setPagination(response.data.meta);
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Failed to load saved questions');
      console.error('Error fetching saved questions:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUnsave = async (questionId: number) => {
    try {
      await api.post(`/posts/${questionId}/save`);
      setSavedQuestions(savedQuestions.filter(q => q.id !== questionId));
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      alert(error.response?.data?.message || 'Failed to unsave question');
    }
  };

  return (
    <div className="pt-4 pb-20 md:pb-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-3">
              <Bookmark className="w-8 h-8" />
              Saved Questions
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              Questions you&apos;ve bookmarked for later reference.
            </p>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-12 text-center">
              <div className="animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-slate-600 dark:text-slate-400">Loading saved questions...</p>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-6 text-center">
              <p className="text-red-600 dark:text-red-400">{error}</p>
              <button
                onClick={() => fetchSavedQuestions(currentPage)}
                className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Questions List */}
          {!loading && !error && savedQuestions.length > 0 && (
            <div className="space-y-4">
              {savedQuestions.map((question) => (
                <article
                  key={question.id}
                  className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition p-6"
                >
                  <div className="flex flex-col sm:flex-row gap-4">
                    {/* Stats Sidebar */}
                    <div className="flex sm:flex-col gap-4 sm:gap-3 text-center sm:min-w-[80px]">
                      <div className="flex-1 sm:flex-none">
                        <div className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                          {question.answers_count || 0}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">Answers</div>
                      </div>
                      <div className="flex-1 sm:flex-none">
                        <div className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                          {question.views_count || 0}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">Views</div>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="mb-3 flex items-start justify-between gap-3">
                        <Link
                          href={`/questions/${question.slug}`}
                          className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition line-clamp-2 flex-1"
                        >
                          {question.title}
                        </Link>
                        <button
                          onClick={() => handleUnsave(question.id)}
                          className="flex-shrink-0 p-2 text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
                          title="Remove from saved"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>

                      <p className="text-slate-600 dark:text-slate-400 mb-4 line-clamp-2">
                        {question.question}
                      </p>

                      {/* Tags */}
                      {question.tags && question.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {question.tags.map((tag) => (
                            <span
                              key={tag.id}
                              className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-full text-sm"
                            >
                              {tag.name}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Footer */}
                      <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xs font-medium">
                            {question.user.name.charAt(0).toUpperCase()}
                          </div>
                          <span>{question.user.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          <span>Asked {formatDate(question.created_at)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && savedQuestions.length === 0 && (
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
          )}

          {/* Pagination */}
          {!loading && pagination && pagination.last_page > 1 && (
            <div className="mt-8 flex justify-center gap-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-800 transition"
              >
                Previous
              </button>
              <span className="px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 rounded-lg">
                Page {currentPage} of {pagination.last_page}
              </span>
              <button
                onClick={() => setCurrentPage(Math.min(pagination.last_page, currentPage + 1))}
                disabled={currentPage === pagination.last_page}
                className="px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-800 transition"
              >
                Next
              </button>
            </div>
          )}
      </div>
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
