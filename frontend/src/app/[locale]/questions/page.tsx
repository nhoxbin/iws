'use client';

import { useEffect, useState } from 'react';
import { HelpCircle, Plus, Clock, Tag as TagIcon } from 'lucide-react';
import Link from 'next/link';
import { AppHeader } from '@/components/app-header';
import api from '@/lib/api';

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
  role?: string;
}

interface Question {
  id: number;
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

export default function QuestionsPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchQuestions(currentPage);
  }, [currentPage, selectedCategory]);

  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories');
      setCategories(response.data.data || []);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const fetchQuestions = async (page: number) => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.get(`/posts?page=${page}`);
      setQuestions(response.data.data || []);
      setPagination(response.data.meta);
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Failed to load questions');
      console.error('Error fetching questions:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) {
      const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
      if (diffInHours === 0) {
        const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
        return `${diffInMinutes} minute${diffInMinutes !== 1 ? 's' : ''} ago`;
      }
      return `${diffInHours} hour${diffInHours !== 1 ? 's' : ''} ago`;
    } else if (diffInDays === 1) {
      return 'Yesterday';
    } else if (diffInDays < 7) {
      return `${diffInDays} days ago`;
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
  };

  const filteredQuestions = selectedCategory === 'all'
    ? questions
    : questions.filter(q => q.category?.name === selectedCategory);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <AppHeader />

      {/* Main Content */}
      <main className="md:ml-20 mt-14 md:mt-16 pt-4 pb-20 md:pb-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-3">
                <HelpCircle className="w-8 h-8" />
                Questions
              </h1>
              <p className="text-slate-600 dark:text-slate-400">
                Browse questions from the community and share your knowledge.
              </p>
            </div>
            <Link
              href="/ask-question"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition shadow-sm"
            >
              <Plus className="w-5 h-5" />
              Ask Question
            </Link>
          </div>

          {/* Category Filter */}
          <div className="mb-6 flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                selectedCategory === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              All
            </button>
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.name)}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  selectedCategory === category.name
                    ? 'bg-blue-600 text-white'
                    : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>

          {/* Loading State */}
          {loading && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-12 text-center">
              <div className="animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-slate-600 dark:text-slate-400">Loading questions...</p>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-6 text-center">
              <p className="text-red-600 dark:text-red-400">{error}</p>
              <button
                onClick={() => fetchQuestions(currentPage)}
                className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Questions List */}
          {!loading && !error && filteredQuestions.length > 0 && (
            <div className="space-y-4">
              {filteredQuestions.map((question) => (
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
                      <div className="mb-3">
                        <Link
                          href={`/questions/${question.id}`}
                          className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition line-clamp-2"
                        >
                          {question.title}
                        </Link>
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
                              className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-full text-sm"
                            >
                              <TagIcon className="w-3 h-3" />
                              {tag.name}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Category Badge */}
                      {question.category && (
                        <div className="mb-4">
                          <span className="inline-flex items-center px-3 py-1 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 rounded-full text-sm font-medium">
                            {question.category.name}
                          </span>
                        </div>
                      )}

                      {/* Footer */}
                      <div className="flex flex-wrap items-center gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-xs">
                            {question.user.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="text-slate-900 dark:text-white font-medium">
                              {question.user.name}
                            </div>
                            {question.user.role && (
                              <div className="text-xs text-slate-500 dark:text-slate-400">
                                {question.user.role}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                          <Clock className="w-4 h-4" />
                          <span>Posted {formatDate(question.created_at)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && filteredQuestions.length === 0 && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-12 text-center">
              <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <HelpCircle className="w-10 h-10 text-slate-400" />
              </div>
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                No questions found
              </h2>
              <p className="text-slate-600 dark:text-slate-400 mb-6">
                {selectedCategory === 'all'
                  ? 'Be the first to ask a question!'
                  : `No questions in ${selectedCategory} category yet.`}
              </p>
              <Link
                href="/ask-question"
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition"
              >
                <Plus className="w-4 h-4" />
                Ask a Question
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
      </main>
    </div>
  );
}
