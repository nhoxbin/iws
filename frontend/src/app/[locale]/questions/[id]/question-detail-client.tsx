'use client';

import { useParams } from 'next/navigation';
import { Link } from '@/lib/navigation';
import { MessageSquare } from 'lucide-react';
import { useQuestionDetail } from '@/hooks/use-question-detail';
import { QuestionHeader } from '@/components/question/question-header';
import { AnswerCard } from '@/components/question/answer-card';
import { AnswerForm } from '@/components/question/answer-form';
import { QuestionSchema } from '@/components/question-schema';

export default function QuestionDetailClient() {
  const routeParams = useParams();
  const questionId = routeParams?.id as string;

  const {
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
  } = useQuestionDetail(questionId);

  if (loading) {
    return (
      <div className="pt-4 pb-20 md:pb-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-12 text-center">
            <div className="animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-slate-600 dark:text-slate-400">Loading question...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !question) {
    return (
      <div className="pt-4 pb-20 md:pb-8 px-4 sm:px-6 lg:px-8">
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
      </div>
    );
  }

  const isQuestionOwner = currentUser?.id === question.user.id;

  return (
    <>
      {/* Add structured data for SEO */}
      <QuestionSchema question={question} />

      <div className="pt-4 pb-20 md:pb-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Question Header */}
          <QuestionHeader
            question={question}
            currentUser={currentUser}
            isSaved={isSaved}
            onSave={handleSaveQuestion}
            onDelete={handleDeleteQuestion}
          />

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
                  <AnswerCard
                    key={answer.id}
                    answer={answer}
                    currentUser={currentUser}
                    isQuestionOwner={isQuestionOwner}
                    onVote={handleVote}
                    onMarkHelpful={handleMarkAsHelpful}
                    onCommentSubmit={handleCommentSubmit}
                    onCommentDelete={handleCommentDelete}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Answer Form */}
          <AnswerForm currentUser={currentUser} onSubmit={handleSubmitAnswer} />
        </div>
      </div>
    </>
  );
}
