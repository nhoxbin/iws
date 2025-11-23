'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/lib/auth-store';
import PrivateRoute from '@/components/private-route';
import { AppHeader } from '@/components/app-header';
import api from '@/lib/api';
import Link from 'next/link';
import { Clock, MessageSquare, Tag as TagIcon } from 'lucide-react';
import { formatDate } from '@/lib/date-utils';

interface Tag {
  id: number;
  name: string;
  posts_count: number;
}

function DashboardPage() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'posts' | 'unanswered' | 'topic' | 'latest'>('posts');
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [popularTags, setPopularTags] = useState<Tag[]>([]);

  useEffect(() => {
    fetchQuestions();
    fetchPopularTags();
  }, [activeTab]);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();

      if (activeTab === 'unanswered') {
        params.append('sort', 'unanswered');
      } else if (activeTab === 'latest') {
        params.append('sort', 'latest');
      }

      const response = await api.get(`/posts?${params.toString()}`);
      setQuestions(response.data.data || []);
    } catch (err) {
      console.error('Error fetching questions:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPopularTags = async () => {
    try {
      const response = await api.get('/tags');
      const tags = response.data.data || [];
      // Get top 5 most used tags
      setPopularTags(tags.slice(0, 5));
    } catch (err) {
      console.error('Error fetching popular tags:', err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <AppHeader />

      {/* Main Content */}
      <main className="md:ml-20 mt-14 md:mt-16 pt-4 pb-20 md:pb-8 px-4 sm:px-6 lg:px-8">

        {/* Tabs */}
        <div className="flex gap-4 mb-6">
          <span className="text-slate-900 dark:text-white font-medium">Questions for you:</span>
          <button
            onClick={() => setActiveTab('posts')}
            className={`px-4 py-1 rounded-full text-sm transition ${
              activeTab === 'posts'
                ? 'bg-blue-600 text-white'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            All Posts
          </button>
          <button
            onClick={() => setActiveTab('unanswered')}
            className={`px-4 py-1 rounded-full text-sm transition ${
              activeTab === 'unanswered'
                ? 'bg-blue-600 text-white'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Unanswered
          </button>
          <button
            onClick={() => setActiveTab('topic')}
            className={`px-4 py-1 rounded-full text-sm transition ${
              activeTab === 'topic'
                ? 'bg-blue-600 text-white'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            By Topic
          </button>
          <button
            onClick={() => setActiveTab('latest')}
            className={`px-4 py-1 rounded-full text-sm transition ${
              activeTab === 'latest'
                ? 'bg-blue-600 text-white'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Latest
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Questions Feed */}
          <div className="lg:col-span-2 space-y-6">
            {loading && (
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-12 text-center">
                <div className="animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-slate-600 dark:text-slate-400">Loading questions...</p>
              </div>
            )}

            {!loading && questions.length === 0 && (
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-12 text-center">
                <p className="text-slate-600 dark:text-slate-400">No questions found.</p>
              </div>
            )}

            {!loading && questions.map((question: any) => (
              <article
                key={question.id}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition p-6"
              >
                {/* Category Badge */}
                {question.category && (
                  <div className="mb-2">
                    <span className="inline-flex items-center px-3 py-1 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 rounded-full text-sm font-medium">
                      {question.category.name}
                    </span>
                  </div>
                )}

                <Link
                  href={`/questions/${question.slug}`}
                  className="block mb-3"
                >
                  <h2 className="text-xl font-semibold text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition line-clamp-2">
                    {question.title}
                  </h2>
                </Link>

                {/* Author & Time */}
                <div className="flex items-center gap-2 text-sm mb-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-xs">
                    {question.user.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <span className="text-slate-900 dark:text-white font-medium">
                      {question.user.name}
                    </span>
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
                  <div className="flex flex-wrap gap-2 mb-3">
                    {question.tags.map((tag: any) => (
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

                {/* Answer Count */}
                <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                  <MessageSquare className="w-4 h-4" />
                  <span>{question.answers_count || 0} answers</span>
                </div>
              </article>
            ))}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Tags */}
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
              <h3 className="text-white font-semibold mb-4">Popular Tags</h3>
              <div className="space-y-2">
                {popularTags.length > 0 ? (
                  popularTags.map((tag) => (
                    <Link
                      key={tag.id}
                      href={`/questions?search=${encodeURIComponent(tag.name)}`}
                      className="flex justify-between items-center text-slate-300 text-sm hover:text-blue-400 transition"
                    >
                      <span>#{tag.name}</span>
                      <span className="text-slate-500 text-xs">{tag.posts_count}</span>
                    </Link>
                  ))
                ) : (
                  <p className="text-slate-400 text-sm">No tags yet</p>
                )}
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
