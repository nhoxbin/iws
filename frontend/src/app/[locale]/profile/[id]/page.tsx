'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { Clock, MessageSquare, ThumbsUp, HelpCircle } from 'lucide-react';
import { Link } from '@/lib/navigation';
import api from '@/lib/api';

interface Activity {
  id: number;
  type: 'question' | 'answer';
  title: string;
  post_id: number;
  slug?: string;
  created_at: string;
  answers_count?: number;
  upvotes_count?: number;
}

interface Post {
  id: number;
  title: string;
  slug: string;
  created_at: string;
  answers_count?: number;
}

interface Answer {
  id: number;
  created_at: string;
  upvotes_count?: number;
  post?: {
    id: number;
    title: string;
    slug: string;
  };
}

interface UserProfile {
  id: number;
  name: string;
  email: string;
  role?: string;
  created_at: string;
}

interface UserStats {
  questionsCount: number;
  answersCount: number;
  helpfulMarksCount: number;
}

interface UserData {
  user: UserProfile;
  stats: UserStats;
  recentActivity: {
    posts: Post[];
    answers: Answer[];
  };
}

function UserProfilePage() {
  const params = useParams();
  const userId = params?.id as string;

  const [userData, setUserData] = useState<UserData | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUserProfile = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.get(`/users/${userId}`);
      setUserData(response.data);

      // Combine activities
      const activityList: Activity[] = [];

      // Add questions
      if (response.data.recentActivity.posts) {
        response.data.recentActivity.posts.forEach((post: Post) => {
          activityList.push({
            id: post.id,
            type: 'question',
            title: post.title,
            post_id: post.id,
            slug: post.slug,
            created_at: post.created_at,
            answers_count: post.answers_count || 0,
          });
        });
      }

      // Add answers
      if (response.data.recentActivity.answers) {
        response.data.recentActivity.answers.forEach((answer: Answer) => {
          if (answer.post?.id) {
            activityList.push({
              id: answer.id,
              type: 'answer',
              title: answer.post.title || 'Question',
              post_id: answer.post.id,
              slug: answer.post.slug,
              created_at: answer.created_at,
              upvotes_count: answer.upvotes_count || 0,
            });
          }
        });
      }

      // Sort by date (most recent first)
      activityList.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      setActivities(activityList);

    } catch (error: unknown) {
      console.error('Error fetching user profile:', error);
      const err = error as { response?: { status?: number } };
      setError(err.response?.status === 404 ? 'User not found' : 'Failed to load user profile');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) {
      fetchUserProfile();
    }
  }, [userId, fetchUserProfile]);

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

  if (loading) {
    return (
      <div className="pt-4 pb-20 md:pb-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="text-center py-12">
            <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !userData) {
    return (
      <div className="pt-4 pb-20 md:pb-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="text-center py-12">
            <HelpCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-foreground mb-2">{error || 'User not found'}</h2>
            <p className="text-muted-foreground mb-6">The user profile you&apos;re looking for doesn&apos;t exist or has been removed.</p>
            <Link href="/dashboard" className="px-6 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg font-medium transition">
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-4 pb-20 md:pb-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Profile Header */}
        <div className="bg-card border border-border rounded-2xl p-8 mb-6">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-6">
              <div className="w-32 h-32 rounded-full bg-linear-to-br from-primary to-primary/80 flex items-center justify-center">
                <span className="text-primary-foreground text-5xl font-bold">
                  {userData.user.name?.charAt(0).toUpperCase() || 'U'}
                </span>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground mb-2">{userData.user.name}</h1>
                <p className="text-muted-foreground text-lg">
                  {userData.user.role ? `${userData.user.role.charAt(0).toUpperCase()}${userData.user.role.slice(1)} Developer` : 'Developer'}
                </p>
                <p className="text-muted-foreground text-sm mt-2 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Member since {new Date(userData.user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Stats Cards */}
            <div className="bg-card border border-border rounded-2xl p-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-muted-foreground text-sm mb-1">Questions</h3>
                  <div className="text-3xl font-bold text-foreground">{userData.stats.questionsCount}</div>
                </div>
                <div>
                  <h3 className="text-muted-foreground text-sm mb-1">Answers</h3>
                  <div className="text-3xl font-bold text-foreground">{userData.stats.answersCount}</div>
                </div>
                <div>
                  <h3 className="text-muted-foreground text-sm mb-1">Total Upvotes</h3>
                  <div className="text-3xl font-bold text-foreground">{userData.stats.helpfulMarksCount}</div>
                </div>
              </div>
            </div>

            {/* Contribution Level */}
            <div className="md:col-span-2 bg-card border border-border rounded-2xl p-6">
              <h2 className="text-xl font-semibold text-foreground mb-4">
                Level: {userData.user.role ? userData.user.role.charAt(0).toUpperCase() + userData.user.role.slice(1) : 'Junior'}
              </h2>
              <p className="text-muted-foreground mb-4">
                This user is an active member of the community, contributing knowledge and helping others.
              </p>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <HelpCircle className="w-4 h-4" />
                  <span>{userData.stats.questionsCount} Questions</span>
                </div>
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  <span>{userData.stats.answersCount} Answers</span>
                </div>
                <div className="flex items-center gap-2">
                  <ThumbsUp className="w-4 h-4" />
                  <span>{userData.stats.helpfulMarksCount} Upvotes</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Activity History */}
        <div className="bg-card border border-border rounded-2xl p-6">
          <h2 className="text-xl font-semibold text-foreground mb-6">Recent Activity</h2>

          {activities.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No activity yet.</p>
            </div>
          )}

          {activities.length > 0 && (
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-[7px] top-2 bottom-2 w-0.5 bg-border"></div>

              <div className="space-y-6">
                {activities.map((activity) => (
                  <Link
                    key={`${activity.type}-${activity.id}`}
                    href={`/questions/${activity.slug || activity.post_id}`}
                    className="flex gap-4 hover:bg-accent p-3 rounded-lg transition -mx-3 relative"
                  >
                    {/* Timeline dot */}
                    <div className="shrink-0 relative z-10">
                      <div className={`w-4 h-4 rounded-full border-2 border-card ${
                        activity.type === 'question' ? 'bg-blue-500' :
                        activity.type === 'answer' ? 'bg-green-500' : 'bg-purple-500'
                      }`}></div>
                    </div>

                    {/* Activity icon */}
                    <div className="shrink-0">
                      {activity.type === 'question' && <HelpCircle className="w-5 h-5 text-blue-500" />}
                      {activity.type === 'answer' && <MessageSquare className="w-5 h-5 text-green-500" />}
                    </div>

                    {/* Activity content */}
                    <div className="flex-1 min-w-0 -ml-2">
                      <h3 className="text-foreground font-medium mb-1 line-clamp-2">
                        {activity.title}
                      </h3>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <p>{formatDate(activity.created_at)}</p>
                        {activity.type === 'question' && activity.answers_count !== undefined && (
                          <span className="flex items-center gap-1">
                            <MessageSquare className="w-3 h-3" />
                            {activity.answers_count} answers
                          </span>
                        )}
                        {activity.type === 'answer' && activity.upvotes_count !== undefined && (
                          <span className="flex items-center gap-1">
                            <ThumbsUp className="w-3 h-3" />
                            {activity.upvotes_count} upvotes
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default UserProfilePage;
