'use client';

import { Link } from '@/lib/navigation';
import { MessageSquare, Tag as TagIcon, Edit, Trash2, CheckCircle } from 'lucide-react';
import { formatDate } from '@/lib/date-utils';
import { RoleBadge } from '@/components/role-badge';

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
  role?: string | null;
}

interface Question {
  id: number;
  title: string;
  question: string;
  slug: string;
  created_at: string;
  answers_count: number;
  is_resolved?: boolean;
  user: User;
  category?: Category;
  tags?: Tag[];
}

interface QuestionCardProps {
  question: Question;
  showActions?: boolean;
  onEdit?: (questionId: number, slug: string) => void;
  onDelete?: (questionId: number) => void;
}

export function QuestionCard({ question, showActions = false, onEdit, onDelete }: QuestionCardProps) {
  const hasAnswers = (question.answers_count || 0) > 0;

  return (
    <article className="bg-card rounded-2xl border border-border shadow-sm hover:shadow-md transition p-6">
      {/* Category Badge */}
      {question.category && (
        <div className="mb-2">
          <span className="inline-flex items-center px-3 py-1 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 rounded-full text-sm font-medium">
            {question.category.name}
          </span>
        </div>
      )}

      {/* Title */}
      <Link href={`/questions/${question.slug}`} className="block mb-3">
        <h2 className="text-xl font-semibold text-foreground hover:text-primary transition line-clamp-2 flex items-start gap-2">
          {question.title}
          {question.is_resolved && (
            <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
          )}
        </h2>
      </Link>

      {/* Author & Time */}
      <div className="flex items-start gap-3 text-sm mb-3">
        <Link href={`/profile/${question.user.id}`}>
          <div className="w-10 h-10 bg-linear-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm cursor-pointer hover:opacity-80 transition">
            {question.user.name.charAt(0).toUpperCase()}
          </div>
        </Link>
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 flex-wrap">
            <Link
              href={`/profile/${question.user.id}`}
              className="text-foreground font-medium hover:text-blue-600 dark:hover:text-blue-400 transition"
            >
              {question.user.name}
            </Link>
            <span className="text-muted-foreground">•</span>
            <span className="text-muted-foreground text-xs">Posted {formatDate(question.created_at)}</span>
          </div>
          <RoleBadge role={question.user.role} />
        </div>
      </div>

      {/* Description */}
      <p className="text-muted-foreground mb-4 line-clamp-2">{question.question}</p>

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

      {/* Footer with stats and actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MessageSquare className="w-4 h-4" />
          <span>{question.answers_count || 0} answers</span>
        </div>

        {/* Action Buttons - only show if showActions is true and no answers */}
        {showActions && !hasAnswers && onEdit && onDelete && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => onEdit(question.id, question.slug)}
              className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition"
              title="Edit"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete(question.id)}
              className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
              title="Delete"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </article>
  );
}
