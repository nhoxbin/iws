'use client';

import { useEffect, useState } from 'react';
import { HelpCircle, Plus, Clock, MessageSquare, Eye, Bookmark, Edit, Trash2, Search } from 'lucide-react';
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

function MyQuestionsPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [filteredQuestions, setFilteredQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'answered' | 'pending'>('all');
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<string>('');

  useEffect(() => {
    fetchCategories();
    fetchMyQuestions(currentPage);
  }, [currentPage]);

  useEffect(() => {
    applyFilters();
  }, [questions, searchQuery, statusFilter, categoryFilter]);

  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories');
      setCategories(response.data.data || []);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const applyFilters = () => {
    let filtered = [...questions];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (q) =>
          q.title.toLowerCase().includes(query) ||
          q.question.toLowerCase().includes(query) ||
          q.tags.some((tag) => tag.name.toLowerCase().includes(query))
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((q) => {
        const hasAnswers = (q.answers_count || 0) > 0;
        return statusFilter === 'answered' ? hasAnswers : !hasAnswers;
      });
    }

    // Category filter
    if (categoryFilter) {
      filtered = filtered.filter((q) => q.category?.id.toString() === categoryFilter);
    }

    setFilteredQuestions(filtered);
  };

  const fetchMyQuestions = async (page: number) => {
    try {
      setLoading(true);
      setError(null);

      // Get current user's ID
      const userResponse = await api.get('/auth/me');
      const userId = userResponse.data.id;

      // Fetch all posts and filter by user
      const response = await api.get(`/posts?page=${page}`);
      const allQuestions = response.data.data;

      // Filter questions by current user
      const userQuestions = allQuestions.filter((q: Question) => q.user.id === userId);

      setQuestions(userQuestions);
      setPagination(response.data.meta);
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Failed to load your questions');
      console.error('Error fetching questions:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (questionId: number) => {
    if (!confirm('Are you sure you want to delete this question?')) {
      return;
    }

    try {
      await api.delete(`/posts/${questionId}`);
      setQuestions(questions.filter(q => q.id !== questionId));
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      alert(error.response?.data?.message || 'Failed to delete question');
    }
  };

  return (
    <div className="pt-4 pb-20 md:pb-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-3">
                <HelpCircle className="w-8 h-8" />
                My Questions
              </h1>
              <p className="text-slate-600 dark:text-slate-400">
                Questions you&apos;ve asked to the community.
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

          {/* Filters */}
          {!loading && (
            <div className="mb-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search questions..."
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Status Filter */}
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as 'all' | 'answered' | 'pending')}
                  className="px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="answered">Answered</option>
                  <option value="pending">Pending</option>
                </select>

                {/* Category Filter */}
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Categories</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Results count */}
              <div className="mt-3 text-sm text-slate-600 dark:text-slate-400">
                Showing {filteredQuestions.length} of {questions.length} question{questions.length !== 1 ? 's' : ''}
              </div>
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-12 text-center">
              <div className="animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-slate-600 dark:text-slate-400">Loading your questions...</p>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-6 text-center">
              <p className="text-red-600 dark:text-red-400">{error}</p>
              <button
                onClick={() => fetchMyQuestions(currentPage)}
                className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Questions List */}
          {!loading && !error && filteredQuestions.length > 0 && (
            <div className="space-y-4">
              {filteredQuestions.map((question) => {
                const hasAnswers = (question.answers_count || 0) > 0;
                return (
                  <article
                    key={question.id}
                    className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition p-6"
                  >
                    {/* Top row: Status/Time, Category, and Actions */}
                    <div className="flex items-center justify-between gap-3 mb-4">
                      <div className="flex items-center gap-3 flex-wrap">
                        {/* Status and Time */}
                        <div className="flex items-center gap-3 text-sm">
                          <div className={`inline-flex items-center gap-1 ${
                            hasAnswers
                              ? 'text-green-600 dark:text-green-400'
                              : 'text-amber-600 dark:text-amber-400'
                          }`}>
                            <span className={`w-2 h-2 rounded-full ${
                              hasAnswers ? 'bg-green-600' : 'bg-amber-600'
                            }`}></span>
                            <span className="font-medium">{hasAnswers ? 'Answered' : 'Open'}</span>
                          </div>
                          <span className="text-slate-500 dark:text-slate-400">·</span>
                          <span className="text-slate-500 dark:text-slate-400">
                            Asked {formatDate(question.created_at)}
                          </span>
                        </div>

                        {/* Category Badge */}
                        {question.category && (
                          <span className="inline-flex items-center px-3 py-1 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 rounded-full text-sm font-medium">
                            {question.category.name}
                          </span>
                        )}
                      </div>

                      {/* Action Buttons - only show if no answers */}
                      {!hasAnswers && (
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/questions/${question.slug}/edit`}
                            className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition"
                            title="Edit"
                          >
                            <Edit className="w-5 h-5" />
                          </Link>
                          <button
                            onClick={() => handleDelete(question.id)}
                            className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
                            title="Delete"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Title */}
                    <div className="mb-3">
                      <Link
                        href={`/questions/${question.slug}`}
                        className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition line-clamp-2"
                      >
                        {question.title}
                      </Link>
                    </div>

                    {/* Question Description */}
                    <p className="text-slate-600 dark:text-slate-400 text-sm mb-4 line-clamp-2">
                      {question.question}
                    </p>

                    {/* Tags */}
                    {question.tags && question.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-3">
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

                    {/* Stats */}
                    <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
                      <div className="flex items-center gap-1">
                        <MessageSquare className="w-4 h-4" />
                        <span>{question.answers_count || 0} Answers</span>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}

          {/* No Results State */}
          {!loading && !error && questions.length > 0 && filteredQuestions.length === 0 && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-12 text-center">
              <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-10 h-10 text-slate-400" />
              </div>
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                No questions found
              </h2>
              <p className="text-slate-600 dark:text-slate-400 mb-6">
                Try adjusting your filters or search query
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('all');
                  setCategoryFilter('');
                }}
                className="px-6 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg font-medium transition"
              >
                Clear Filters
              </button>
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && questions.length === 0 && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-12 text-center">
              <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <HelpCircle className="w-10 h-10 text-slate-400" />
              </div>
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                No questions yet
              </h2>
              <p className="text-slate-600 dark:text-slate-400 mb-6">
                Start asking questions to get help from the community
              </p>
              <Link
                href="/ask-question"
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition"
              >
                <Plus className="w-4 h-4" />
                Ask Your First Question
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

export default function MyQuestions() {
  return (
    <PrivateRoute>
      <MyQuestionsPage />
    </PrivateRoute>
  );
}
