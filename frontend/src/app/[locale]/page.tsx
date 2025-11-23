'use client';

import { Link } from '@/lib/navigation';
import { useAuthStore } from '@/lib/auth-store';

export default function HomePage() {
  const { isAuthenticated } = useAuthStore();

  // If authenticated, show dashboard link instead of redirecting
  // This prevents unwanted redirects when reloading other pages
  if (isAuthenticated) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-6">
        <div className="max-w-xl mx-auto text-center">
          <div className="mb-8 flex justify-center">
            <div className="w-20 h-20 bg-blue-500 rounded-2xl flex items-center justify-center shadow-2xl">
              <span className="text-white font-bold text-4xl">IWS</span>
            </div>
          </div>
          <h1 className="text-4xl font-bold text-white mb-6">
            Welcome Back!
          </h1>
          <p className="text-xl text-slate-400 mb-8">
            You&apos;re already logged in
          </p>
          <Link
            href="/dashboard"
            className="inline-block px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-lg transition-all shadow-lg hover:shadow-blue-500/50"
          >
            Go to Dashboard
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-6">
      <div className="max-w-4xl mx-auto text-center">
        {/* Logo */}
        <div className="mb-8 flex justify-center">
          <div className="w-20 h-20 bg-blue-500 rounded-2xl flex items-center justify-center shadow-2xl">
            <span className="text-white font-bold text-4xl">IWS</span>
          </div>
        </div>

        {/* Hero Text */}
        <h1 className="text-6xl font-bold text-white mb-6">
          Interview Wisdom Share
        </h1>
        <p className="text-2xl text-slate-400 mb-12">
          Connect, Learn, and Grow with the Developer Community
        </p>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
            <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mb-4 mx-auto">
              <span className="text-3xl">💡</span>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Ask Questions</h3>
            <p className="text-slate-400">Get expert answers from experienced developers</p>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
            <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mb-4 mx-auto">
              <span className="text-3xl">🎯</span>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Share Knowledge</h3>
            <p className="text-slate-400">Help others by sharing your expertise</p>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
            <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mb-4 mx-auto">
              <span className="text-3xl">🚀</span>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Grow Together</h3>
            <p className="text-slate-400">Level up your skills with the community</p>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link
            href="/register"
            className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-lg transition-all shadow-lg hover:shadow-blue-500/50"
          >
            Get Started
          </Link>
          <Link
            href="/login"
            className="px-8 py-4 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white rounded-xl font-semibold text-lg transition-all"
          >
            Sign In
          </Link>
        </div>

        {/* Footer */}
        <div className="mt-16 text-slate-500 text-sm">
          <p>Join thousands of developers improving their interview skills</p>
        </div>
      </div>
    </main>
  );
}
