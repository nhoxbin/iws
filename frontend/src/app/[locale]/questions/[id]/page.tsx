'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Clock,
  Tag as TagIcon,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  Bookmark,
  BookmarkCheck,
  Send,
  Edit,
  Trash2,
  Reply
} from 'lucide-react';
import Link from 'next/link';
import { AppHeader } from '@/components/app-header';
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

interface Comment {
  id: number;
  content: string;
  created_at: string;
  user: User;
  replies?: Comment[];
}

interface Answer {
  id: number;
  answer: string;
  created_at: string;
  updated_at: string;
  user: User;
  upvotes_count?: number;
  downvotes_count?: number;
  is_helpful?: boolean;
  user_vote?: 'upvote' | 'downvote' | null;
  comments?: Comment[];
  can_be_edited?: boolean;
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
  answers?: Answer[];
  answers_count?: number;
  views_count?: number;
  is_saved?: boolean;
  is_resolved?: boolean;
  upvotes_count?: number;
  downvotes_count?: number;
  user_vote?: 'upvote' | 'downvote' | null;
}

export default function QuestionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const questionId = params.id as string;

  const [question, setQuestion] = useState<Question | null>(null);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [newAnswer, setNewAnswer] = useState('');
  const [submittingAnswer, setSubmittingAnswer] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [commentingOnAnswer, setCommentingOnAnswer] = useState<number | null>(null);
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    fetchCurrentUser();
    fetchQuestion();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [questionId]);

  const fetchCurrentUser = async () => {
    try {
      const response = await api.get('/auth/me');
      setCurrentUser(response.data);
    } catch (err) {
      console.error('Error fetching current user:', err);
    }
  };

  const fetchQuestion = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.get(`/posts/${questionId}`);
      const questionData = response.data.data;
      setQuestion(questionData);

      setAnswers(questionData.answers || []);
      setIsSaved(questionData.is_saved || false);
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Failed to load question');
      console.error('Error fetching question:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveQuestion = async () => {
    try {
      await api.post(`/posts/${questionId}/save`);
      setIsSaved(!isSaved);
    } catch (err) {
      console.error('Error saving question:', err);
    }
  };

  const handleSubmitAnswer = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newAnswer.trim()) {
      return;
    }

    try {
      setSubmittingAnswer(true);

      // For now, we'll add the answer optimistically
      // You'll need to create the backend endpoint for this
      const response = await api.post(`/posts/${questionId}/answers`, {
        answer: newAnswer
      });

      const newAnswerData = response.data.data;
      setAnswers([...answers, newAnswerData]);
      setNewAnswer('');

      if (question) {
        setQuestion({
          ...question,
          answers_count: (question.answers_count || 0) + 1
        });
      }
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      alert(error.response?.data?.message || 'Failed to submit answer');
    } finally {
      setSubmittingAnswer(false);
    }
  };

  const handleDeleteQuestion = async () => {
    if (!confirm('Are you sure you want to delete this question?')) {
      return;
    }

    try {
      await api.delete(`/posts/${questionId}`);
      router.push('/questions');
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      alert(error.response?.data?.message || 'Failed to delete question');
    }
  };

  const handleVote = async (answerId: number, voteType: 'upvote' | 'downvote') => {
    try {
      const response = await api.post(`/answers/${answerId}/vote`, { vote_type: voteType });
      const updatedAnswer = response.data.data;

      setAnswers(answers.map(answer =>
        answer.id === answerId ? updatedAnswer : answer
      ));
    } catch (err) {
      console.error('Error voting on answer:', err);
      const error = err as { response?: { data?: { message?: string } } };
      alert(error.response?.data?.message || 'Failed to vote on answer');
    }
  };

  const handleMarkAsHelpful = async (answerId: number) => {
    try {
      const response = await api.post(`/answers/${answerId}/mark-helpful`);
      const updatedAnswer = response.data.data;

      setAnswers(answers.map(answer =>
        answer.id === answerId ? updatedAnswer : answer
      ));

      // Update the question's is_resolved status
      if (question) {
        const hasHelpfulAnswer = answers.some(a =>
          a.id === answerId ? updatedAnswer.is_helpful : a.is_helpful
        );
        setQuestion({ ...question, is_resolved: hasHelpfulAnswer });
      }
    } catch (err) {
      console.error('Error marking answer as helpful:', err);
      const error = err as { response?: { data?: { message?: string } } };
      alert(error.response?.data?.message || 'Failed to mark answer as helpful');
    }
  };

  const handleCommentSubmit = async (answerId: number) => {
    if (!newComment.trim()) {
      return;
    }

    try {
      const response = await api.post(`/answers/${answerId}/comments`, {
        content: newComment
      });

      const newCommentData = response.data.data;

      setAnswers(answers.map(answer =>
        answer.id === answerId
          ? {
              ...answer,
              comments: [...(answer.comments || []), newCommentData]
            }
          : answer
      ));

      setNewComment('');
      setCommentingOnAnswer(null);
    } catch (err) {
      console.error('Error posting comment:', err);
      const error = err as { response?: { data?: { message?: string } } };
      alert(error.response?.data?.message || 'Failed to post comment');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
        <AppHeader />
        <main className="md:ml-20 mt-14 md:mt-16 pt-4 pb-20 md:pb-8 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-12 text-center">
              <div className="animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-slate-600 dark:text-slate-400">Loading question...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error || !question) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
        <AppHeader />
        <main className="md:ml-20 mt-14 md:mt-16 pt-4 pb-20 md:pb-8 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-6 text-center">
              <p className="text-red-600 dark:text-red-400">{error || 'Question not found'}</p>
              <Link
                href="/questions"
                className="mt-4 inline-block px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition"
              >
                Back to Questions
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <AppHeader />

      <main className="md:ml-20 mt-14 md:mt-16 pt-4 pb-20 md:pb-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
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

          {/* Category Badge - Outside the card */}
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
            <div className="mb-4">
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
                {question.title}
              </h1>
            </div>

            {/* Author Info and Time */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                {question.user.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <div className="text-slate-900 dark:text-white font-medium">
                  {question.user.name}
                </div>
                {question.user.role && (
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    {question.user.role}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                <Clock className="w-4 h-4" />
                <span>{formatDate(question.created_at)}</span>
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
                      <TagIcon className="w-3 h-3" />
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
                  <MessageSquare className="w-4 h-4" />
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
                    onClick={handleSaveQuestion}
                    className="p-2.5 text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
                    title={isSaved ? 'Unsave question' : 'Save question'}
                  >
                    {isSaved ? <BookmarkCheck className="w-6 h-6" /> : <Bookmark className="w-6 h-6" />}
                  </button>
                )}
                {currentUser && currentUser.id === question.user.id && (!question.answers_count || question.answers_count === 0) && (
                  <>
                    <Link
                      href={`/questions/${question.slug}/edit`}
                      className="p-2.5 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition"
                      title="Edit question"
                    >
                      <Edit className="w-6 h-6" />
                    </Link>
                    <button
                      onClick={handleDeleteQuestion}
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

          {/* Answers Section */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
              Answers ({answers.length})
            </h2>

            {answers.length === 0 ? (
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-8 text-center">
                <MessageSquare className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                <p className="text-slate-600 dark:text-slate-400">
                  No answers yet. Be the first to answer this question!
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {answers.map((answer) => (
                  <article
                    key={answer.id}
                    className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6"
                  >
                    {/* Answer Header - Avatar and name on top */}
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-teal-600 rounded-full flex items-center justify-center text-white font-semibold">
                        {answer.user.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <div className="text-slate-900 dark:text-white font-medium">
                          {answer.user.name}
                        </div>
                        {answer.user.role && (
                          <div className="text-xs text-slate-500 dark:text-slate-400">
                            {answer.user.role}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                        <Clock className="w-4 h-4" />
                        <span>{formatDate(answer.created_at)}</span>
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
                        <button
                          onClick={() => setCommentingOnAnswer(commentingOnAnswer === answer.id ? null : answer.id)}
                          className="flex items-center gap-2 px-3 py-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
                        >
                          <Reply className="w-4 h-4" />
                          <span className="text-sm">Comment</span>
                        </button>
                        {/* Show edit/delete if user owns the answer and it hasn't been voted */}
                        {currentUser && currentUser.id === answer.user.id && ((answer.upvotes_count || 0) === 0 && (answer.downvotes_count || 0) === 0) && (
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
                        {/* Show message if answer has been voted */}
                        {currentUser && currentUser.id === answer.user.id && ((answer.upvotes_count || 0) > 0 || (answer.downvotes_count || 0) > 0) && (
                          <span className="text-xs text-slate-500 dark:text-slate-400 italic">
                            Cannot edit/delete (has votes)
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {currentUser && (
                          <>
                            <button
                              onClick={() => handleVote(answer.id, 'upvote')}
                              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                                answer.user_vote === 'upvote'
                                  ? 'bg-green-600 text-white'
                                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-green-50 dark:hover:bg-slate-700'
                              }`}
                              title="Upvote"
                            >
                              <ThumbsUp className="w-4 h-4" />
                              <span className="text-sm font-medium">
                                {answer.upvotes_count || 0}
                              </span>
                            </button>
                            <button
                              onClick={() => handleVote(answer.id, 'downvote')}
                              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                                answer.user_vote === 'downvote'
                                  ? 'bg-red-600 text-white'
                                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-red-50 dark:hover:bg-slate-700'
                              }`}
                              title="Downvote"
                            >
                              <ThumbsDown className="w-4 h-4" />
                              <span className="text-sm font-medium">
                                {answer.downvotes_count || 0}
                              </span>
                            </button>
                            {/* Mark as Helpful button - only for post owner */}
                            {currentUser.id === question?.user.id && (
                              <button
                                onClick={() => handleMarkAsHelpful(answer.id)}
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
                        )}
                      </div>
                    </div>

                    {/* Comment Section */}
                    {commentingOnAnswer === answer.id && currentUser && (
                      <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800">
                        <div className="flex gap-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-xs shrink-0">
                            {currentUser.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1">
                            <textarea
                              value={newComment}
                              onChange={(e) => setNewComment(e.target.value)}
                              placeholder="Add a comment..."
                              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                              rows={2}
                            />
                            <div className="flex justify-end gap-2 mt-2">
                              <button
                                onClick={() => {
                                  setCommentingOnAnswer(null);
                                  setNewComment('');
                                }}
                                className="px-3 py-1 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={() => handleCommentSubmit(answer.id)}
                                disabled={!newComment.trim()}
                                className="px-4 py-1 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                Post
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Display Comments */}
                    {answer.comments && answer.comments.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800 space-y-3">
                        {answer.comments.map((comment) => (
                          <div key={comment.id} className="flex gap-3">
                            <div className="w-8 h-8 bg-gradient-to-br from-gray-500 to-gray-600 rounded-full flex items-center justify-center text-white font-semibold text-xs shrink-0">
                              {comment.user.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-sm font-medium text-slate-900 dark:text-white">
                                  {comment.user.name}
                                </span>
                                <span className="text-xs text-slate-500 dark:text-slate-400">
                                  {formatDate(comment.created_at)}
                                </span>
                              </div>
                              <p className="text-sm text-slate-700 dark:text-slate-300">
                                {comment.content}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </article>
                ))}
              </div>
            )}
          </div>

          {/* Answer Form */}
          {currentUser && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
                Your Answer
              </h3>
              <form onSubmit={handleSubmitAnswer}>
                <textarea
                  value={newAnswer}
                  onChange={(e) => setNewAnswer(e.target.value)}
                  placeholder="Share your experience and insights. Markdown is supported."
                  className="w-full min-h-[200px] px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
                  required
                />
                <div className="mt-4 flex justify-end">
                  <button
                    type="submit"
                    disabled={submittingAnswer || !newAnswer.trim()}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submittingAnswer ? (
                      <>
                        <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Submit Answer
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {!currentUser && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-6 text-center">
              <p className="text-blue-900 dark:text-blue-200 mb-4">
                Please log in to answer this question
              </p>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition"
              >
                Log In
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
