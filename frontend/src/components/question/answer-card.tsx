import { ThumbsUp, ThumbsDown, Edit, Trash2 } from 'lucide-react';
import { Link } from '@/lib/navigation';
import { formatDate } from '@/lib/date-utils';
import { CommentSection } from '../question/comment-section';

interface User {
  id: number;
  name: string;
  email: string;
  role?: string;
  job_description?: string;
}

interface Comment {
  id: number;
  content: string;
  tagged_user?: User | null;
  created_at: string;
  user: User;
  replies?: Comment[];
}

interface Answer {
  id: number;
  answer: string;
  created_at: string;
  user: User;
  upvotes_count?: number;
  downvotes_count?: number;
  is_helpful?: boolean;
  user_vote?: 'upvote' | 'downvote' | null;
  comments?: Comment[];
}

interface AnswerCardProps {
  answer: Answer;
  currentUser: User | null;
  isQuestionOwner: boolean;
  onVote: (answerId: number, voteType: 'upvote' | 'downvote') => void;
  onMarkHelpful: (answerId: number) => void;
  onCommentSubmit: (answerId: number, content: string, parentId: number | null, taggedUserId?: number) => void;
  onCommentDelete: (commentId: number, answerId: number, isReply: boolean, parentCommentId?: number) => void;
}

export function AnswerCard({
  answer,
  currentUser,
  isQuestionOwner,
  onVote,
  onMarkHelpful,
  onCommentSubmit,
  onCommentDelete,
}: AnswerCardProps) {
  const isOwner = currentUser?.id === answer.user.id;
  const hasVotes = (answer.upvotes_count || 0) > 0 || (answer.downvotes_count || 0) > 0;
  const canEdit = isOwner && !hasVotes;

  return (
    <article className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
      {/* Answer Header */}
      <div className="flex items-start gap-3 mb-4">
        <Link href={`/profile/${answer.user.id}`}>
          <div className="w-10 h-10 bg-linear-to-br from-green-500 to-teal-600 rounded-full flex items-center justify-center text-white font-semibold shrink-0 cursor-pointer hover:opacity-80 transition">
            {answer.user.name.charAt(0).toUpperCase()}
          </div>
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <Link
              href={`/profile/${answer.user.id}`}
              className="text-slate-900 dark:text-white font-semibold hover:text-blue-600 dark:hover:text-blue-400 transition"
            >
              {answer.user.name}
            </Link>
            {answer.user.role && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs font-medium rounded">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                {answer.user.role}
              </span>
            )}
            <span className="text-slate-500 dark:text-slate-400 text-sm">
              • {formatDate(answer.created_at)}
            </span>
          </div>
          {answer.user.job_description && (
            <div className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              {answer.user.job_description}
            </div>
          )}
        </div>
      </div>

      {/* Answer Body */}
      <div className="prose dark:prose-invert max-w-none mb-4">
        <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
          {answer.answer}
        </p>
      </div>

      {/* Answer Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2">
          {canEdit && (
            <>
              <button
                className="flex items-center gap-2 px-3 py-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition"
                title="Edit answer"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button
                className="flex items-center gap-2 px-3 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
                title="Delete answer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </>
          )}
          {isOwner && hasVotes && (
            <span className="text-xs text-slate-500 dark:text-slate-400 italic">
              Cannot edit/delete (has votes)
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {currentUser ? (
            <>
              <button
                onClick={() => onVote(answer.id, 'upvote')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                  answer.user_vote === 'upvote'
                    ? 'bg-green-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-green-50 dark:hover:bg-slate-700'
                }`}
                title="Upvote"
              >
                <ThumbsUp className="w-4 h-4" />
                <span className="text-sm font-medium">{answer.upvotes_count || 0}</span>
              </button>
              <button
                onClick={() => onVote(answer.id, 'downvote')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                  answer.user_vote === 'downvote'
                    ? 'bg-red-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-red-50 dark:hover:bg-slate-700'
                }`}
                title="Downvote"
              >
                <ThumbsDown className="w-4 h-4" />
                <span className="text-sm font-medium">{answer.downvotes_count || 0}</span>
              </button>
              {isQuestionOwner && (
                <button
                  onClick={() => onMarkHelpful(answer.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                    answer.is_helpful
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-slate-700'
                  }`}
                  title="Mark as Helpful (Post Owner)"
                >
                  <span className="text-sm font-medium">
                    {answer.is_helpful ? '✓ Helpful' : 'Mark Helpful'}
                  </span>
                </button>
              )}
            </>
          ) : (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg">
                <ThumbsUp className="w-4 h-4" />
                <span className="text-sm font-medium">{answer.upvotes_count || 0}</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg">
                <ThumbsDown className="w-4 h-4" />
                <span className="text-sm font-medium">{answer.downvotes_count || 0}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Comments */}
      {currentUser ? (
        <CommentSection
          answerId={answer.id}
          comments={answer.comments || []}
          currentUser={currentUser}
          onCommentSubmit={onCommentSubmit}
          onCommentDelete={onCommentDelete}
        />
      ) : (
        answer.comments && answer.comments.length > 0 && (
          <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {answer.comments.length} comment{answer.comments.length !== 1 ? 's' : ''} • Log in to view and add comments
            </p>
          </div>
        )
      )}
    </article>
  );
}
