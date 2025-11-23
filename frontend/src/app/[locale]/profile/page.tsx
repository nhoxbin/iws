'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/lib/auth-store';
import { CheckCircle2, Clock, AtSign, MessageSquare, ThumbsUp, HelpCircle } from 'lucide-react';
import Link from 'next/link';
import PrivateRoute from '@/components/private-route';
import { AppHeader } from '@/components/app-header';
import api from '@/lib/api';

interface Activity {
  id: number;
  type: 'question' | 'answer' | 'helpful';
  title: string;
  post_id: number;
  created_at: string;
  is_answered?: boolean;
}

function ProfilePage() {
  const { user } = useAuthStore();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [stats, setStats] = useState({
    questionsCount: 0,
    answersCount: 0,
    helpfulMarksCount: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActivityHistory();
  }, []);

  const fetchActivityHistory = async () => {
    try {
      setLoading(true);

      // Get current user
      const userResponse = await api.get('/auth/me');
      const currentUserId = userResponse.data.id;

      // Fetch all posts to get user's questions and answers
      const postsResponse = await api.get('/posts');
      const allPosts = postsResponse.data.data;

      // Filter user's questions
      const userPosts = allPosts.filter((post: any) => post.user.id === currentUserId);

      // Extract user's answers from all posts
      const userAnswers: any[] = [];
      let totalHelpfulMarks = 0;

      for (const post of allPosts) {
        if (post.answers && post.answers.length > 0) {
          const userAnswersInPost = post.answers.filter((answer: any) => answer.user.id === currentUserId);
          userAnswers.push(...userAnswersInPost.map((ans: any) => ({
            ...ans,
            post_title: post.title,
            post_id: post.id,
            post_slug: post.slug,
          })));
          // Count upvotes
          userAnswersInPost.forEach((ans: any) => {
            totalHelpfulMarks += ans.upvotes_count || 0;
          });
        }
      }

      // Combine activities
      const activityList: Activity[] = [];

      // Add questions
      userPosts.forEach((post: any) => {
        activityList.push({
          id: post.id,
          type: 'question',
          title: post.title,
          post_id: post.slug || post.id,
          created_at: post.created_at,
          is_answered: (post.answers_count || 0) > 0,
        });
      });

      // Add answers
      userAnswers.forEach((answer: any) => {
        activityList.push({
          id: answer.id,
          type: 'answer',
          title: answer.post_title,
          post_id: answer.post_slug || answer.post_id,
          created_at: answer.created_at,
        });
      });

      // Sort by date (most recent first)
      activityList.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      setActivities(activityList.slice(0, 10)); // Show latest 10 activities
      setStats({
        questionsCount: userPosts.length,
        answersCount: userAnswers.length,
        helpfulMarksCount: totalHelpfulMarks,
      });
    } catch (error) {
      console.error('Error fetching activity:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) {
      return 'Today';
    } else if (diffInDays === 1) {
      return 'Yesterday';
    } else if (diffInDays < 7) {
      return `${diffInDays} days ago`;
    } else if (diffInDays < 30) {
      const weeks = Math.floor(diffInDays / 7);
      return `${weeks} week${weeks !== 1 ? 's' : ''} ago`;
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'question':
        return <HelpCircle className="w-5 h-5 text-blue-500" />;
      case 'answer':
        return <MessageSquare className="w-5 h-5 text-green-500" />;
      case 'helpful':
        return <ThumbsUp className="w-5 h-5 text-purple-500" />;
      default:
        return <Clock className="w-5 h-5 text-slate-400" />;
    }
  };

  const getActivityLabel = (activity: Activity) => {
    switch (activity.type) {
      case 'question':
        return activity.is_answered ? 'Answered' : 'Awaiting answer';
      case 'answer':
        return 'Answered';
      case 'helpful':
        return 'Marked helpful';
      default:
        return '';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <AppHeader showSearch={false} />

      {/* Main Content */}
      <main className="md:ml-20 mt-14 md:mt-16 pt-4 pb-20 md:pb-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          {/* Profile Header */}
          <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 mb-6">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-6">
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-slate-700 to-slate-600 flex items-center justify-center">
                  <span className="text-white text-5xl font-bold">{user?.name?.charAt(0).toUpperCase() || 'A'}</span>
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white mb-2">{user?.name || 'Alex Doe'}</h1>
                  <p className="text-slate-400 text-lg">{user?.role ? `${user.role.charAt(0).toUpperCase()}${user.role.slice(1)} Developer` : 'Junior Developer'}</p>
                </div>
              </div>
              <Link href="/edit-profile">
                <button className="px-6 py-2 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition">
                  Edit Profile
                </button>
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {/* Current Level Card */}
            <div className="md:col-span-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Current Level: {user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'Junior'}</h2>
              <p className="text-slate-400 mb-6">
                Advance your career by updating your seniority level when you&apos;re ready.
              </p>
              <button className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition inline-flex items-center gap-2">
                Update Level
                <Clock className="w-4 h-4" />
              </button>
              <p className="text-slate-500 text-sm mt-3 flex items-center gap-2">
                <AtSign className="w-4 h-4" />
                You can update once every 6 months.
              </p>
            </div>

            {/* Stats Card */}
            <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-slate-400 text-sm mb-1">Questions</h3>
                  <div className="text-3xl font-bold text-white">{stats.questionsCount}</div>
                </div>
                <div>
                  <h3 className="text-slate-400 text-sm mb-1">Answers</h3>
                  <div className="text-3xl font-bold text-white">{stats.answersCount}</div>
                </div>
                <div>
                  <h3 className="text-slate-400 text-sm mb-1">Total Upvotes</h3>
                  <div className="text-3xl font-bold text-white">{stats.helpfulMarksCount}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Activity History */}
          <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
            <h2 className="text-xl font-semibold text-white mb-6">Activity History</h2>

            {loading && (
              <div className="text-center py-8">
                <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-3"></div>
                <p className="text-slate-400 text-sm">Loading activity...</p>
              </div>
            )}

            {!loading && activities.length === 0 && (
              <div className="text-center py-8">
                <p className="text-slate-400">No activity yet. Start asking questions or providing answers!</p>
              </div>
            )}

            {!loading && activities.length > 0 && (
              <div className="relative">
                {/* Timeline line */}
                <div className="absolute left-[7px] top-2 bottom-2 w-0.5 bg-slate-700"></div>

                <div className="space-y-6">
                  {activities.map((activity, index) => (
                    <Link
                      key={`${activity.type}-${activity.id}`}
                      href={`/questions/${activity.post_id}`}
                      className="flex gap-4 hover:bg-slate-900/50 p-3 rounded-lg transition -mx-3 relative"
                    >
                      {/* Timeline dot */}
                      <div className="flex-shrink-0 relative z-10">
                        <div className={`w-4 h-4 rounded-full border-2 border-slate-950 ${
                          activity.type === 'question' ? 'bg-blue-500' :
                          activity.type === 'answer' ? 'bg-green-500' : 'bg-purple-500'
                        }`}></div>
                      </div>

                      <div className="flex-1 min-w-0 -ml-2">
                        <h3 className="text-white font-medium mb-1 line-clamp-2">
                          {activity.title}
                        </h3>
                        <p className="text-slate-400 text-sm">
                          {formatDate(activity.created_at)}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {!loading && activities.length > 0 && (
              <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-800">
                <Link
                  href="/my-questions"
                  className="text-blue-500 hover:text-blue-600 dark:hover:text-blue-400 text-sm font-medium"
                >
                  View all questions →
                </Link>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default function Profile() {
  return (
    <PrivateRoute>
      <ProfilePage />
    </PrivateRoute>
  );
}
