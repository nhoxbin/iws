import React from 'react';
import { Send } from 'lucide-react';
import { Link } from '@/lib/navigation';

interface AnswerFormProps {
  currentUser: { name: string; id: number } | null;
  onSubmit: (answer: string) => Promise<boolean>;
}

export function AnswerForm({ currentUser, onSubmit }: AnswerFormProps) {
  const [newAnswer, setNewAnswer] = React.useState('');
  const [submitting, setSubmitting] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newAnswer.trim()) return;

    setSubmitting(true);
    const success = await onSubmit(newAnswer);
    if (success) {
      setNewAnswer('');
    }
    setSubmitting(false);
  };

  if (!currentUser) {
    return (
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
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
      <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
        Your Answer
      </h3>
      <form onSubmit={handleSubmit}>
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
            disabled={submitting || !newAnswer.trim()}
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? (
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
  );
}
