'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import PrivateRoute from '@/components/private-route';
import { AppHeader } from '@/components/app-header';

function AskQuestionPage() {
  const router = useRouter();
  const [question, setQuestion] = useState('');
  const [tags, setTags] = useState('');
  const [additionalContext, setAdditionalContext] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle question submission
    console.log({ question, tags, additionalContext });
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <AppHeader showSearch={false} />

      {/* Main Content */}
      <main className="md:ml-20 mt-14 md:mt-16 pt-4 pb-20 md:pb-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-3">
              Ask a New Question
            </h1>
            <p className="text-slate-600 dark:text-slate-400 text-base sm:text-lg">
              Get insights from experienced professionals in your field.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-lg p-6 sm:p-8">
            {/* Question */}
            <div className="mb-6">
              <label htmlFor="question" className="block text-sm font-medium text-slate-900 dark:text-white mb-2">
                Question
              </label>
              <textarea
                id="question"
                rows={5}
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                placeholder="What's your question? Be specific and imagine you're asking a real person."
                required
              />
            </div>

            {/* Tags */}
            <div className="mb-6">
              <label htmlFor="tags" className="block text-sm font-medium text-slate-900 dark:text-white mb-2">
                Tags
              </label>
              <input
                type="text"
                id="tags"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Add up to 5 tags... (e.g., #React, #SystemDesign)"
              />
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                Separate tags with commas to help others find your question
              </p>
            </div>

            {/* Additional Context */}
            <div className="mb-8">
              <label htmlFor="context" className="block text-sm font-medium text-slate-900 dark:text-white mb-2">
                Additional Context <span className="text-slate-400">(Optional)</span>
              </label>
              <textarea
                id="context"
                rows={4}
                value={additionalContext}
                onChange={(e) => setAdditionalContext(e.target.value)}
                className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                placeholder="Provide any background, code snippets, or details that might help answer your question."
              />
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-6 py-3 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition text-center"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition shadow-lg hover:shadow-blue-500/50 text-center"
              >
                Submit Question
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

export default function AskQuestion() {
  return (
    <PrivateRoute>
      <AskQuestionPage />
    </PrivateRoute>
  );
}
