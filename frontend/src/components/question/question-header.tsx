import { Link } from '@/lib/navigation';
import { Edit, Trash2, Bookmark, BookmarkCheck } from 'lucide-react';
import { formatDate } from '@/lib/date-utils';

interface User {
  id: number;
  name: string;
  email: string;
  role?: string;
  job_description?: string;
}

interface Category {
  id: number;
  name: string;
}

interface Tag {
  id: number;
  name: string;
}

interface QuestionHeaderProps {
  question: {
    id: number;
    slug: string;
    title: string;
    question: string;
    created_at: string;
    user: User;
    tags: Tag[];
    category?: Category;
    answers_count?: number;
    views_count?: number;
    is_saved?: boolean;
  };
  currentUser: User | null;
  isSaved: boolean;
  onSave: () => void;
  onDelete: () => void;
}

export function QuestionHeader({ question, currentUser, isSaved, onSave, onDelete }: QuestionHeaderProps) {
  const isOwner = currentUser?.id === question.user.id;
  const canEdit = isOwner && (!question.answers_count || question.answers_count === 0);

  return (
    <>
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
        <Link href="/" className="hover:text-blue-600 dark:hover:text-blue-400">
          Home
        </Link>
        <span>/</span>
        <Link href="/questions" className="hover:text-blue-600 dark:hover:text-blue-400">
          Questions
        </Link>
        <span>/</span>
        <span className="text-slate-900 dark:text-white">{question.title}</span>
      </nav>

      {/* Category Badge */}
      {question.category && (
        <div className="mb-4">
          <Link href={`/questions?category=${question.category.id}`}>
            <span className="inline-flex items-center px-4 py-1.5 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 rounded-full text-base font-medium hover:bg-purple-100 dark:hover:bg-purple-900/30 transition cursor-pointer">
              {question.category.name}
            </span>
          </Link>
        </div>
      )}

      {/* Question Card */}
      <article className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 mb-6">
        {/* Question Title */}
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-4">
          {question.title}
        </h1>

        {/* Author Info */}
        <div className="flex items-start gap-3 mb-4">
          <Link href={`/profile/${question.user.id}`}>
            <div className="w-10 h-10 bg-linear-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold shrink-0 cursor-pointer hover:opacity-80 transition">
              {question.user.name.charAt(0).toUpperCase()}
            </div>
          </Link>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <Link
                href={`/profile/${question.user.id}`}
                className="text-slate-900 dark:text-white font-semibold hover:text-blue-600 dark:hover:text-blue-400 transition"
              >
                {question.user.name}
              </Link>
              {question.user.role && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs font-medium rounded">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  {question.user.role}
                </span>
              )}
              <span className="text-slate-500 dark:text-slate-400 text-sm">
                • {formatDate(question.created_at)}
              </span>
            </div>
            {question.user.job_description && (
              <div className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                {question.user.job_description}
              </div>
            )}
          </div>
        </div>

        {/* Question Body */}
        <div className="prose dark:prose-invert max-w-none mb-4">
          <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
            {question.question}
          </p>
        </div>

        {/* Tags */}
        {question.tags && question.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {question.tags.map((tag) => (
              <Link key={tag.id} href={`/questions?tag=${tag.id}`}>
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-full text-sm hover:bg-blue-100 dark:hover:bg-blue-900/30 transition cursor-pointer">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                  {tag.name}
                </span>
              </Link>
            ))}
          </div>
        )}

        {/* Question Meta and Actions */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <span>{question.answers_count || 0} answers</span>
            </div>
            <div className="flex items-center gap-2">
              <span>{question.views_count || 0} views</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {currentUser && (
              <button
                onClick={onSave}
                className="p-2.5 text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
                title={isSaved ? 'Unsave question' : 'Save question'}
              >
                {isSaved ? <BookmarkCheck className="w-6 h-6" /> : <Bookmark className="w-6 h-6" />}
              </button>
            )}
            {canEdit && (
              <>
                <Link
                  href={`/questions/${question.slug}/edit`}
                  className="p-2.5 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition"
                  title="Edit question"
                >
                  <Edit className="w-6 h-6" />
                </Link>
                <button
                  onClick={onDelete}
                  className="p-2.5 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
                  title="Delete question"
                >
                  <Trash2 className="w-6 h-6" />
                </button>
              </>
            )}
          </div>
        </div>
      </article>
    </>
  );
}
