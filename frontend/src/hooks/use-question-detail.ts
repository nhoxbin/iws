import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from '@/lib/navigation';
import { toast } from 'sonner';
import api from '@/lib/api';
import { useConfirmDialog } from '@/components/confirm-dialog';
import { useAuthStore } from '@/lib/auth-store';

interface User {
  id: number;
  name: string;
  email: string;
  role?: string;
  job_description?: string;
}

interface Tag {
  id: number;
  name: string;
}

interface Category {
  id: number;
  name: string;
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

export function useQuestionDetail(questionId: string) {
  const router = useRouter();
  const { confirm } = useConfirmDialog();
  const [question, setQuestion] = useState<Question | null>(null);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Get current user from auth store instead of fetching
  const { user: currentUser } = useAuthStore();

  // Fetch question when questionId changes
  useEffect(() => {
    const fetchQuestion = async () => {
      // Abort previous request if it exists
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Create new AbortController for this request
      abortControllerRef.current = new AbortController();

      try {
        setLoading(true);
        setError(null);

        const response = await api.get(`/posts/${questionId}`, {
          signal: abortControllerRef.current.signal,
        });

        const questionData = response.data.data;
        setQuestion(questionData);
        setAnswers(questionData.answers || []);
        setIsSaved(questionData.is_saved || false);
      } catch (err) {
        // Ignore abort errors
        const errorObj = err as { name?: string; response?: { data?: { message?: string } } };
        if (errorObj.name === 'CanceledError' || errorObj.name === 'AbortError') {
          return;
        }

        setError(errorObj.response?.data?.message || 'Failed to load question');
        console.error('Error fetching question:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchQuestion();

    return () => {
      // Abort the request if component unmounts
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [questionId]);

  const handleSaveQuestion = useCallback(async () => {
    if (!currentUser) {
      toast.error('Please log in to save questions');
      router.push('/login');
      return;
    }
    try {
      await api.post(`/posts/${questionId}/save`);
      setIsSaved(!isSaved);
    } catch (err) {
      console.error('Error saving question:', err);
      toast.error('Failed to save question');
    }
  }, [questionId, isSaved, currentUser, router]);

  const handleDeleteQuestion = useCallback(() => {
    if (!currentUser) {
      toast.error('Please log in to delete questions');
      router.push('/login');
      return;
    }
    confirm({
      title: 'Delete Question',
      message: 'Are you sure you want to delete this question? This action cannot be undone.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
      onConfirm: async () => {
        try {
          await api.delete(`/posts/${questionId}`);
          toast.success('Question deleted successfully');
          router.push('/questions');
        } catch (err) {
          const error = err as { response?: { data?: { message?: string } } };
          toast.error(error.response?.data?.message || 'Failed to delete question');
          throw err;
        }
      },
    });
  }, [questionId, router, confirm, currentUser]);

  const handleVote = useCallback(async (answerId: number, voteType: 'upvote' | 'downvote') => {
    if (!currentUser) {
      toast.error('Please log in to vote on answers');
      router.push('/login');
      return;
    }
    try {
      const response = await api.post(`/answers/${answerId}/vote`, { vote_type: voteType });
      const updatedAnswer = response.data.data;

      setAnswers(prevAnswers =>
        prevAnswers.map(answer =>
          answer.id === answerId ? { ...updatedAnswer, comments: answer.comments } : answer
        )
      );
    } catch (err) {
      console.error('Error voting on answer:', err);
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || 'Failed to vote on answer');
    }
  }, [currentUser, router]);

  const handleMarkAsHelpful = useCallback(async (answerId: number) => {
    if (!currentUser) {
      toast.error('Please log in to mark answers as helpful');
      router.push('/login');
      return;
    }
    try {
      const response = await api.post(`/answers/${answerId}/mark-helpful`);
      const updatedAnswer = response.data.data;

      setAnswers(prevAnswers =>
        prevAnswers.map(answer =>
          answer.id === answerId ? { ...updatedAnswer, comments: answer.comments } : answer
        )
      );

      if (question) {
        const hasHelpfulAnswer = answers.some(a =>
          a.id === answerId ? updatedAnswer.is_helpful : a.is_helpful
        );
        setQuestion({ ...question, is_resolved: hasHelpfulAnswer });
      }
    } catch (err) {
      console.error('Error marking answer as helpful:', err);
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || 'Failed to mark answer as helpful');
    }
  }, [question, answers, currentUser, router]);

  const handleSubmitAnswer = useCallback(async (answerText: string): Promise<boolean> => {
    if (!currentUser) {
      toast.error('Please log in to submit an answer');
      return false;
    }
    if (!answerText.trim()) return false;

    try {
      const response = await api.post(`/posts/${questionId}/answers`, {
        answer: answerText
      });

      const newAnswerData = response.data.data;
      setAnswers(prevAnswers => [...prevAnswers, newAnswerData]);

      if (question) {
        setQuestion({
          ...question,
          answers_count: (question.answers_count || 0) + 1
        });
      }

      return true;
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || 'Failed to submit answer');
      return false;
    }
  }, [questionId, question, currentUser]);

  const handleCommentSubmit = useCallback(async (
    answerId: number,
    content: string,
    parentId: number | null,
    taggedUserId?: number
  ) => {
    if (!currentUser) {
      toast.error('Please log in to comment');
      router.push('/login');
      return;
    }
    if (!content.trim()) return;

    try {
      const response = await api.post(`/answers/${answerId}/comments`, {
        content,
        parent_id: parentId,
        tagged_user_id: taggedUserId
      });

      const newComment = response.data.data;

      setAnswers(prevAnswers =>
        prevAnswers.map(answer => {
          if (answer.id !== answerId) return answer;

          if (parentId) {
            return {
              ...answer,
              comments: (answer.comments || []).map(comment => {
                if (comment.id === parentId) {
                  return {
                    ...comment,
                    replies: [...(comment.replies || []), newComment]
                  };
                }
                return comment;
              })
            };
          } else {
            return {
              ...answer,
              comments: [...(answer.comments || []), newComment]
            };
          }
        })
      );
    } catch (err) {
      console.error('Error posting comment:', err);
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || 'Failed to post comment');
    }
  }, [currentUser, router]);

  const handleCommentDelete = useCallback((
    commentId: number,
    answerId: number,
    isReply: boolean = false,
    parentCommentId?: number
  ) => {
    if (!currentUser) {
      toast.error('Please log in to delete comments');
      router.push('/login');
      return;
    }
    const answer = answers.find(a => a.id === answerId);
    const parentComment = answer?.comments?.find(c => c.id === commentId);
    const hasReplies = !isReply && parentComment?.replies && parentComment.replies.length > 0;

    let confirmMessage = 'Are you sure you want to delete this comment?';
    if (hasReplies) {
      const repliesCount = parentComment?.replies?.length || 0;
      confirmMessage = `Delete this comment and all ${repliesCount} ${repliesCount === 1 ? 'reply' : 'replies'}?`;
    }

    confirm({
      title: 'Delete Comment',
      message: confirmMessage,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
      onConfirm: async () => {
        try {
          await api.delete(`/comments/${commentId}`);

          setAnswers(prevAnswers =>
            prevAnswers.map(answer => {
              if (answer.id !== answerId) return answer;

              if (isReply && parentCommentId) {
                return {
                  ...answer,
                  comments: (answer.comments || []).map(comment => {
                    if (comment.id === parentCommentId) {
                      return {
                        ...comment,
                        replies: (comment.replies || []).filter(r => r.id !== commentId)
                      };
                    }
                    return comment;
                  })
                };
              } else {
                return {
                  ...answer,
                  comments: (answer.comments || []).filter(c => c.id !== commentId)
                };
              }
            })
          );
          toast.success('Comment deleted successfully');
        } catch (err) {
          console.error('Error deleting comment:', err);
          const error = err as { response?: { data?: { message?: string } } };
          toast.error(error.response?.data?.message || 'Failed to delete comment');
          throw err;
        }
      },
    });
  }, [answers, confirm, currentUser, router]);

  return {
    question,
    answers,
    loading,
    error,
    currentUser,
    isSaved,
    handleSaveQuestion,
    handleDeleteQuestion,
    handleVote,
    handleMarkAsHelpful,
    handleSubmitAnswer,
    handleCommentSubmit,
    handleCommentDelete,
  };
}
