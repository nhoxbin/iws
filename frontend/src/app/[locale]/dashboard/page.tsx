'use client';

import { useState } from 'react';
import { Link } from '@/lib/navigation';
import { MessageSquare, Tag as TagIcon } from 'lucide-react';
import { formatDate } from '@/lib/date-utils';
import { usePopularTags, usePosts } from '@/hooks/use-cached-data';
import { QuestionCardSkeleton } from '@/components/skeletons';
import { PopularTags } from '@/components/popular-tags';
import { TopContributors } from '@/components/top-contributors';

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
    id: number;
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
  const { tags: popularTags, isLoading: tagsLoading } = usePopularTags();
  const { posts: questions, isLoading: loading } = usePosts(
    activeTab === 'unanswered' ? { sort: 'unanswered' } :
    activeTab === 'latest' ? { sort: 'latest' } : {}
  );

  console.log('Dashboard - popularTags:', popularTags, 'tagsLoading:', tagsLoading);

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
                  <Link href={`/profile/${question.user.id}`}>
                    <div className="w-8 h-8 bg-linear-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-xs cursor-pointer hover:opacity-80 transition">
                      {question.user.name.charAt(0).toUpperCase()}
                    </div>
                  </Link>
                  <div>
                    <Link
                      href={`/profile/${question.user.id}`}
                      className="text-foreground font-medium hover:text-blue-600 dark:hover:text-blue-400 transition"
                    >
                      {question.user.name}
                    </Link>
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
            <PopularTags tags={popularTags} loading={tagsLoading} />
            <TopContributors loading={loading} />
          </div>
        </div>
    </div>
  );
}

export default function Dashboard() {
  return <DashboardPage />;
}
