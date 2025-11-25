'use client';

import { useState } from 'react';
import { usePosts } from '@/hooks/use-cached-data';
import { QuestionCardSkeleton } from '@/components/skeletons';
import { PopularTags } from '@/components/popular-tags';
import { TopContributors } from '@/components/top-contributors';
import { QuestionCard } from '@/components/question-card';

interface Tag {
  id: number;
  name: string;
  posts_count?: number;
}

interface Category {
  id: number;
  name: string;
}

interface User {
  id: number;
  name: string;
}

interface Question {
  id: number;
  title: string;
  question: string;
  slug: string;
  created_at: string;
  answers_count: number;
  user: User;
  category?: Category;
  tags?: Tag[];
}

function DashboardPage() {
  const [activeTab, setActiveTab] = useState<'posts' | 'unanswered' | 'topic' | 'latest'>('posts');

  // Use SWR cached hooks for better performance
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
              <QuestionCard key={question.id} question={question} />
            ))}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <PopularTags />
            <TopContributors />
          </div>
        </div>
    </div>
  );
}

export default function Dashboard() {
  return <DashboardPage />;
}
