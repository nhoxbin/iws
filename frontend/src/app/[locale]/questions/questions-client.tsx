'use client';

import { useEffect, useState, useCallback } from 'react';
import { HelpCircle, Plus, Tag as TagIcon } from 'lucide-react';
import { Link } from '@/lib/navigation';
import { useSearchParams } from 'next/navigation';
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
  role?: string;
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

export default function QuestionsPage() {
  const searchParams = useSearchParams();
  const urlSearch = searchParams?.get('search') || '';

  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedTag, setSelectedTag] = useState<string>('');
  const [searchText, setSearchText] = useState<string>(urlSearch);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);

  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories');
      setCategories(response.data.data || []);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const fetchTags = async () => {
    try {
      const response = await api.get('/tags');
      setTags(response.data.data || []);
    } catch (err) {
      console.error('Error fetching tags:', err);
    }
  };

  const fetchQuestions = useCallback(async (page: number) => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      params.append('page', page.toString());

      if (searchText) params.append('search', searchText);
      if (selectedCategory) params.append('category', selectedCategory);
      if (selectedTag) params.append('tag', selectedTag);

      const response = await api.get(`/posts?${params.toString()}`);
      setQuestions(response.data.data || []);
      setPagination(response.data.meta);
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Failed to load questions');
      console.error('Error fetching questions:', err);
    } finally {
      setLoading(false);
    }
  }, [searchText, selectedCategory, selectedTag]);

  useEffect(() => {
    fetchCategories();
    fetchTags();
  }, []);

  // Update searchText when URL search param changes
  useEffect(() => {
    setSearchText(urlSearch);
  }, [urlSearch]);

  // Fetch questions when filters change (with debounce) or page changes
  useEffect(() => {
    // When filters change, reset to page 1
    if (searchText || selectedCategory || selectedTag) {
      const timer = setTimeout(() => {
        setCurrentPage(1);
        fetchQuestions(1);
      }, 500);

      return () => clearTimeout(timer);
    } else {
      // No filters, just fetch current page
      fetchQuestions(currentPage);
    }
  }, [searchText, selectedCategory, selectedTag, currentPage, fetchQuestions]);

  return (
    <div className="pt-4 pb-20 md:pb-8 px-4 sm:px-6 lg:px-8">
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

          {/* Search Filters */}
          <div className="mb-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Search Text Input */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Search
                </label>
                <input
                  type="text"
                  placeholder="Search questions..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Category Filter */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Category
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Categories</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Tag Filter */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Tag
                </label>
                <select
                  value={selectedTag}
                  onChange={(e) => setSelectedTag(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Tags</option>
                  {tags.map((tag) => (
                    <option key={tag.id} value={tag.id}>
                      {tag.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
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
          {!loading && !error && questions.length > 0 && (
            <div className="space-y-4">
              {questions.map((question) => (
                <article
                  key={question.id}
                  className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition p-6"
                >
                  <div className="flex flex-col sm:flex-row gap-4">
                    {/* Stats Sidebar */}
                    <div className="flex sm:flex-col gap-4 sm:gap-3 text-center sm:min-w-20">
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
                      {/* Category Badge */}
                      {question.category && (
                        <div className="mb-2">
                          <span className="inline-flex items-center px-3 py-1 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 rounded-full text-sm font-medium">
                            {question.category.name}
                          </span>
                        </div>
                      )}

                      <div className="mb-3">
                        <Link
                          href={`/questions/${question.slug}`}
                          className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition line-clamp-2"
                        >
                          {question.title}
                        </Link>
                      </div>

                      {/* Author & Time */}
                      <div className="flex items-center gap-2 text-sm mb-3">
                        <Link href={`/profile/${question.user.id}`}>
                          <div className="w-8 h-8 bg-linear-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-xs cursor-pointer hover:opacity-80 transition">
                            {question.user.name.charAt(0).toUpperCase()}
                          </div>
                        </Link>
                        <div>
                          <Link
                            href={`/profile/${question.user.id}`}
                            className="text-slate-900 dark:text-white font-medium hover:text-blue-600 dark:hover:text-blue-400 transition"
                          >
                            {question.user.name}
                          </Link>
                          <span className="text-slate-500 dark:text-slate-400 mx-1">•</span>
                          <span className="text-slate-500 dark:text-slate-400">
                            Posted {formatDate(question.created_at)}
                          </span>
                        </div>
                      </div>

                      <p className="text-slate-600 dark:text-slate-400 mb-4 line-clamp-2">
                        {question.question}
                      </p>

                      {/* Tags */}
                      {question.tags && question.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
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
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && questions.length === 0 && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-12 text-center">
              <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <HelpCircle className="w-10 h-10 text-slate-400" />
              </div>
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                No questions found
              </h2>
              <p className="text-slate-600 dark:text-slate-400 mb-6">
                {searchText || selectedCategory || selectedTag
                  ? 'Try adjusting your search filters.'
                  : 'Be the first to ask a question!'}
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
    </div>
  );
}
