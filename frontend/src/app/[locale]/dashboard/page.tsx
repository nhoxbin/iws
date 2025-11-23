'use client';

import { useState } from 'react';
import PrivateRoute from '@/components/private-route';
import { Link } from '@/lib/navigation';
import { MessageSquare, Tag as TagIcon } from 'lucide-react';
import { formatDate } from '@/lib/date-utils';
import { usePopularTags, usePosts } from '@/hooks/use-cached-data';
import { QuestionCardSkeleton, SidebarSkeleton } from '@/components/skeletons';

interface Tag {
  id: number;
  name: string;
  posts_count: number;
}

interface Question {
  id: number;
  title: string;
  question: string;
  slug: string;
  created_at: string;
  answers_count: number;
  user: {
    name: string;
  };
  category?: {
    name: string;
  };
  tags?: Tag[];
}

function DashboardPage() {
  const [activeTab, setActiveTab] = useState<'posts' | 'unanswered' | 'topic' | 'latest'>('posts');

  // Use SWR cached hooks for better performance
  const { tags: popularTags } = usePopularTags();
  const { posts: questions, isLoading: loading } = usePosts(
    activeTab === 'unanswered' ? { sort: 'unanswered' } :
    activeTab === 'latest' ? { sort: 'latest' } : {}
  );

  return (
    <div className="pt-4 pb-20 md:pb-8 px-4 sm:px-6 lg:px-8">

        {/* Tabs */}
        <div className="flex gap-4 mb-6">
          <span className="text-foreground font-medium">Questions for you:</span>
          <button
            onClick={() => setActiveTab('posts')}
            className={`px-4 py-1 rounded-full text-sm transition ${
              activeTab === 'posts'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            All Posts
          </button>
          <button
            onClick={() => setActiveTab('unanswered')}
            className={`px-4 py-1 rounded-full text-sm transition ${
              activeTab === 'unanswered'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Unanswered
          </button>
          <button
            onClick={() => setActiveTab('topic')}
            className={`px-4 py-1 rounded-full text-sm transition ${
              activeTab === 'topic'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            By Topic
          </button>
          <button
            onClick={() => setActiveTab('latest')}
            className={`px-4 py-1 rounded-full text-sm transition ${
              activeTab === 'latest'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Latest
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Questions Feed */}
          <div className="lg:col-span-2 space-y-6">
            {loading && (
              <>
                <QuestionCardSkeleton />
                <QuestionCardSkeleton />
                <QuestionCardSkeleton />
              </>
            )}

            {!loading && questions.length === 0 && (
              <div className="bg-card rounded-2xl border border-border shadow-sm p-12 text-center">
                <p className="text-muted-foreground">No questions found.</p>
              </div>
            )}

            {!loading && questions.map((question: Question) => (
              <article
                key={question.id}
                className="bg-card rounded-2xl border border-border shadow-sm hover:shadow-md transition p-6"
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
                  <h2 className="text-xl font-semibold text-foreground hover:text-primary transition line-clamp-2">
                    {question.title}
                  </h2>
                </Link>

                {/* Author & Time */}
                <div className="flex items-center gap-2 text-sm mb-3">
                  <div className="w-8 h-8 bg-linear-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-xs">
                    {question.user.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <span className="text-foreground font-medium">
                      {question.user.name}
                    </span>
                    <span className="text-muted-foreground mx-1">•</span>
                    <span className="text-muted-foreground">
                      Posted {formatDate(question.created_at)}
                    </span>
                  </div>
                </div>

                <p className="text-muted-foreground mb-4 line-clamp-2">
                  {question.question}
                </p>

                {/* Tags */}
                {question.tags && question.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {question.tags.map((tag: Tag) => (
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
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MessageSquare className="w-4 h-4" />
                  <span>{question.answers_count || 0} answers</span>
                </div>
              </article>
            ))}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Tags */}
            {loading ? (
              <SidebarSkeleton />
            ) : (
              <div className="bg-card border border-border rounded-xl p-6">
                <h3 className="text-foreground font-semibold mb-4">Popular Tags</h3>
                <div className="space-y-2">
                  {popularTags.length > 0 ? (
                    popularTags.map((tag: Tag) => (
                    <Link
                      key={tag.id}
                      href={`/questions?search=${encodeURIComponent(tag.name)}`}
                      className="flex justify-between items-center text-muted-foreground text-sm hover:text-primary transition"
                    >
                      <span>#{tag.name}</span>
                      <span className="text-muted-foreground/60 text-xs">{tag.posts_count}</span>
                    </Link>
                  ))
                ) : (
                    <p className="text-muted-foreground text-sm">No tags yet</p>
                  )}
                </div>
              </div>
            )}

            {/* Top Contributors */}
            <div className="bg-card border border-border rounded-xl p-6">
              <h3 className="text-foreground font-semibold mb-4">Top Contributors</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-muted"></div>
                  <div className="flex-1">
                    <div className="text-foreground text-sm font-medium">Alex Smith</div>
                    <div className="text-muted-foreground text-xs">128 Answers</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-muted"></div>
                  <div className="flex-1">
                    <div className="text-foreground text-sm font-medium">Maria Garcia</div>
                    <div className="text-muted-foreground text-xs">97 Answers</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-muted"></div>
                  <div className="flex-1">
                    <div className="text-foreground text-sm font-medium">Ken Tanaka</div>
                    <div className="text-muted-foreground text-xs">85 Answers</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
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
