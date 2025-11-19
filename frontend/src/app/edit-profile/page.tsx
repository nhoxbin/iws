'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/auth-store';
import { X } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';
import PrivateRoute from '@/components/private-route';
import { AppHeader } from '@/components/app-header';

function EditProfilePage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [interests, setInterests] = useState<string[]>(['Technology', 'Arts']);
  const [newInterest, setNewInterest] = useState('');
  const [currentLevel, setCurrentLevel] = useState('Senior Software Engineer');

  useEffect(() => {
    if (user) {
      setFullName(user.name || '');
      setEmail(user.email || '');
    }
  }, [user]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle profile update
    console.log({ fullName, email, interests, currentLevel });
  };

  const addInterest = () => {
    if (newInterest && newInterest.trim() && !interests.includes(newInterest.trim())) {
      setInterests([...interests, newInterest.trim()]);
      setNewInterest('');
    }
  };

  const removeInterest = (interest: string) => {
    setInterests(interests.filter(i => i !== interest));
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <AppHeader showSearch={false} />

      {/* Main Content */}
      <main className="md:ml-20 mt-14 md:mt-16 pt-4 pb-20 md:pb-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-2">
              Edit Profile
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              Update your personal and professional information.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Information */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 sm:p-8">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-6">
                Personal Information
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="fullName" className="block text-sm font-medium text-slate-900 dark:text-white mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="fullName"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="John Doe"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-slate-900 dark:text-white mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-500 dark:text-slate-400"
                    disabled
                  />
                  <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                    Contact support to change your email.
                  </p>
                </div>
              </div>
            </div>

            {/* Areas of Expertise */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 sm:p-8">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-6">
                Areas of Expertise
              </h2>

              <div>
                <label htmlFor="interests" className="block text-sm font-medium text-slate-900 dark:text-white mb-2">
                  Interests
                </label>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    id="interests"
                    value={newInterest}
                    onChange={(e) => setNewInterest(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addInterest())}
                    className="flex-1 px-4 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Science, Business..."
                  />
                  <button
                    type="button"
                    onClick={addInterest}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {interests.map((interest) => (
                    <span
                      key={interest}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300 rounded-full text-sm font-medium"
                    >
                      {interest}
                      <button
                        type="button"
                        onClick={() => removeInterest(interest)}
                        className="hover:text-purple-900 dark:hover:text-purple-100"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Theme Settings */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 sm:p-8">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-6">
                Appearance
              </h2>

              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-sm font-medium text-slate-900 dark:text-white mb-1">
                    Theme
                  </label>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Choose your preferred theme
                  </p>
                </div>
                <ThemeToggle />
              </div>
            </div>

            {/* Professional Level */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 sm:p-8">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-6">
                Professional Level
              </h2>

              <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-6 border border-slate-200 dark:border-slate-700">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Current Level</p>
                    <p className="text-lg font-semibold text-slate-900 dark:text-white">
                      {currentLevel}
                    </p>
                  </div>
                  <button
                    type="button"
                    className="px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition text-sm font-medium"
                  >
                    Update Level
                  </button>
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  You can update your level once every 6 months.
                </p>
              </div>
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
                className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition shadow-lg text-center"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

export default function EditProfile() {
  return (
    <PrivateRoute>
      <EditProfilePage />
    </PrivateRoute>
  );
}
