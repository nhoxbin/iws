import { useState } from 'react';
import { Link } from '@/lib/navigation';
import { AtSign } from 'lucide-react';
import { formatDate } from '@/lib/date-utils';
import { UserMention } from '@/components/user-mention';

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

interface CommentSectionProps {
  answerId: number;
  comments: Comment[];
  currentUser: User;
  onCommentSubmit: (answerId: number, content: string, parentId: number | null, taggedUserId?: number) => void;
  onCommentDelete: (commentId: number, answerId: number, isReply: boolean, parentCommentId?: number) => void;
}

export function CommentSection({
  answerId,
  comments,
  currentUser,
  onCommentSubmit,
  onCommentDelete,
}: CommentSectionProps) {
  const [isCommenting, setIsCommenting] = useState(false);
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [commentText, setCommentText] = useState('');
  const [showMention, setShowMention] = useState(false);
  const [mentionSearch, setMentionSearch] = useState('');
  const [taggedUser, setTaggedUser] = useState<User | null>(null);

  const handleCommentChange = (value: string) => {
    setCommentText(value);

    const lastAtIndex = value.lastIndexOf('@');
    if (lastAtIndex !== -1) {
      const textAfterAt = value.slice(lastAtIndex + 1);
      if (!textAfterAt.includes(' ') && textAfterAt.length > 0) {
        setShowMention(true);
        setMentionSearch(textAfterAt);
      } else {
        setShowMention(false);
      }
    } else {
      setShowMention(false);
    }
  };

  const handleUserSelect = (user: User) => {
    const lastAtIndex = commentText.lastIndexOf('@');
    const beforeAt = commentText.slice(0, lastAtIndex);
    const afterAt = commentText.slice(lastAtIndex + 1).split(' ').slice(1).join(' ');

    setCommentText(`${beforeAt}@${user.name} ${afterAt}`);
    setTaggedUser(user);
    setShowMention(false);
    setMentionSearch('');
  };

  const handleSubmit = () => {
    if (!commentText.trim()) return;

    onCommentSubmit(answerId, commentText, replyingTo, taggedUser?.id);
    resetForm();
  };

  const handleReply = (commentId: number, user: User) => {
    setReplyingTo(commentId);
    setTaggedUser(user);
    setCommentText(`@${user.name} `);
  };

  const resetForm = () => {
    setCommentText('');
    setIsCommenting(false);
    setReplyingTo(null);
    setTaggedUser(null);
    setShowMention(false);
    setMentionSearch('');
  };

  const removeTag = () => {
    setTaggedUser(null);
    if (taggedUser) {
      setCommentText(commentText.replace(`@${taggedUser.name}`, '').trim());
    }
  };

  return (
    <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800">
      {/* Comment Form */}
      {isCommenting && (
        <div className="mb-4">
          <div className="flex gap-3">
            <div className="w-8 h-8 bg-linear-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-xs shrink-0">
              {currentUser.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 relative">
              {taggedUser && (
                <div className="flex flex-wrap gap-2 mb-2">
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded text-xs">
                    <AtSign className="w-3 h-3" />
                    {taggedUser.name}
                    <button onClick={removeTag} className="ml-1 hover:text-blue-900 dark:hover:text-blue-100">
                      ×
                    </button>
                  </span>
                </div>
              )}
              {showMention && (
                <UserMention searchTerm={mentionSearch} onSelect={handleUserSelect} />
              )}
              <textarea
                value={commentText}
                onChange={(e) => handleCommentChange(e.target.value)}
                placeholder="Add a comment... (Use @ to tag a user)"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                rows={2}
              />
              <div className="flex justify-between items-center mt-2">
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  <AtSign className="w-3 h-3 inline" /> Type @ to mention a user
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={resetForm}
                    className="px-3 py-1 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={!commentText.trim()}
                    className="px-4 py-1 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Post
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toggle Comment Button */}
      {!isCommenting && (
        <button
          onClick={() => setIsCommenting(true)}
          className="flex items-center gap-2 px-3 py-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition mb-4"
        >
          <AtSign className="w-4 h-4" />
          <span className="text-sm">Comment</span>
        </button>
      )}

      {/* Comments List */}
      {comments.length > 0 && (
        <div className="space-y-3">
          {comments.map((comment) => (
            <div key={comment.id}>
              {/* Parent Comment */}
              <div className="flex gap-3">
                <div className="w-10 h-10 bg-linear-to-br from-gray-500 to-gray-600 rounded-full flex items-center justify-center text-white font-semibold text-sm shrink-0">
                  {comment.user.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <Link
                      href={`/profile/${comment.user.id}`}
                      className="text-sm font-semibold text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400"
                    >
                      {comment.user.name}
                    </Link>
                    {comment.user.role && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-300 text-xs font-medium rounded">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        {comment.user.role}
                      </span>
                    )}
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      • {formatDate(comment.created_at)}
                    </span>
                  </div>
                  {comment.user.job_description && (
                    <div className="text-xs text-slate-600 dark:text-slate-400 mb-1">
                      {comment.user.job_description}
                    </div>
                  )}
                  <p className="text-sm text-slate-700 dark:text-slate-300">
                    {comment.tagged_user && (
                      <Link
                        href={`/profile/${comment.tagged_user.id}`}
                        className="text-blue-600 dark:text-blue-400 font-medium hover:underline"
                      >
                        @{comment.tagged_user.name}
                      </Link>
                    )}
                    {comment.tagged_user
                      ? ` ${comment.content.replace(`@${comment.tagged_user.name}`, '').trim()}`
                      : comment.content}
                  </p>
                  <div className="flex items-center gap-3 mt-2">
                    <button
                      onClick={() => handleReply(comment.id, comment.user)}
                      className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      Answer
                    </button>
                    {currentUser.id === comment.user.id && (
                      <button
                        onClick={() => onCommentDelete(comment.id, answerId, false)}
                        className="text-xs text-red-600 dark:text-red-400 hover:underline"
                      >
                        Delete
                      </button>
                    )}
                  </div>

                  {/* Reply Form */}
                  {replyingTo === comment.id && (
                    <div className="mt-3 pl-4 border-l-2 border-slate-300 dark:border-slate-600">
                      <div className="flex gap-3">
                        <div className="w-8 h-8 bg-linear-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-xs shrink-0">
                          {currentUser.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 relative">
                          {showMention && (
                            <UserMention searchTerm={mentionSearch} onSelect={handleUserSelect} />
                          )}
                          <textarea
                            value={commentText}
                            onChange={(e) => handleCommentChange(e.target.value)}
                            placeholder="Add your answer..."
                            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            rows={2}
                          />
                          <div className="flex justify-end gap-2 mt-2">
                            <button onClick={resetForm} className="px-3 py-1 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white">
                              Cancel
                            </button>
                            <button
                              onClick={handleSubmit}
                              disabled={!commentText.trim()}
                              className="px-4 py-1 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              Post
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Replies */}
              {comment.replies && comment.replies.length > 0 && (
                <div className="ml-12 mt-3 space-y-3 pl-4 border-l-2 border-slate-200 dark:border-slate-700">
                  {comment.replies.map((reply) => (
                    <div key={reply.id} className="flex gap-3">
                      <div className="w-8 h-8 bg-linear-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-semibold text-xs shrink-0">
                        {reply.user.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <Link
                            href={`/profile/${reply.user.id}`}
                            className="text-sm font-semibold text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400"
                          >
                            {reply.user.name}
                          </Link>
                          {reply.user.role && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-medium rounded">
                              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                              {reply.user.role}
                            </span>
                          )}
                          <span className="text-xs text-slate-500 dark:text-slate-400">
                            • {formatDate(reply.created_at)}
                          </span>
                        </div>
                        {reply.user.job_description && (
                          <div className="text-xs text-slate-600 dark:text-slate-400 mb-1">
                            {reply.user.job_description}
                          </div>
                        )}
                        <p className="text-sm text-slate-700 dark:text-slate-300">
                          {reply.tagged_user && (
                            <Link
                              href={`/profile/${reply.tagged_user.id}`}
                              className="text-blue-600 dark:text-blue-400 font-medium hover:underline"
                            >
                              @{reply.tagged_user.name}
                            </Link>
                          )}
                          {reply.tagged_user
                            ? ` ${reply.content.replace(`@${reply.tagged_user.name}`, '').trim()}`
                            : reply.content}
                        </p>
                        {currentUser.id === reply.user.id && (
                          <button
                            onClick={() => onCommentDelete(reply.id, answerId, true, comment.id)}
                            className="text-xs text-red-600 dark:text-red-400 hover:underline mt-2"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
