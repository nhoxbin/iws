'use client';

import { useEffect, useState } from 'react';
import { Bell, Check, MessageSquare, ThumbsUp, HelpCircle, X } from 'lucide-react';
import Link from 'next/link';
import PrivateRoute from '@/components/private-route';
import { AppHeader } from '@/components/app-header';
import api from '@/lib/api';

interface User {
  id: number;
  name: string;
}

interface Post {
  id: number;
  title: string;
}

interface Notification {
  id: number;
  type: string;
  message: string;
  post_id: number | null;
  related_user_id: number | null;
  read: boolean;
  created_at: string;
  post?: Post;
  related_user?: User;
}

function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await api.get('/notifications');
      setNotifications(response.data.data || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: number) => {
    try {
      await api.post(`/notifications/${id}/read`);
      setNotifications(notifications.map(n =>
        n.id === id ? { ...n, read: true } : n
      ));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.post('/notifications/read-all');
      setNotifications(notifications.map(n => ({ ...n, read: true })));
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'answer_received':
        return <MessageSquare className="w-5 h-5 text-green-500" />;
      case 'helpful_marked':
        return <ThumbsUp className="w-5 h-5 text-purple-500" />;
      case 'question_updated':
        return <HelpCircle className="w-5 h-5 text-blue-500" />;
      default:
        return <Bell className="w-5 h-5 text-slate-400" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else if (diffInDays < 7) {
      return `${diffInDays}d ago`;
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  const filteredNotifications = filter === 'all'
    ? notifications
    : notifications.filter(n => !n.read);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <AppHeader />

      <main className="md:ml-20 mt-14 md:mt-16 pt-4 pb-20 md:pb-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Bell className="w-8 h-8 text-slate-900 dark:text-white" />
                <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">
                  Notifications
                </h1>
              </div>
              {notifications.some(n => !n.read) && (
                <button
                  onClick={markAllAsRead}
                  className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                >
                  Mark all as read
                </button>
              )}
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 border-b border-slate-200 dark:border-slate-800">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 font-medium transition relative ${
                  filter === 'all'
                    ? 'text-blue-600 dark:text-blue-400'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                All
                {filter === 'all' && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400" />
                )}
              </button>
              <button
                onClick={() => setFilter('unread')}
                className={`px-4 py-2 font-medium transition relative ${
                  filter === 'unread'
                    ? 'text-blue-600 dark:text-blue-400'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                Unread
                {notifications.filter(n => !n.read).length > 0 && (
                  <span className="ml-2 px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs rounded-full">
                    {notifications.filter(n => !n.read).length}
                  </span>
                )}
                {filter === 'unread' && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400" />
                )}
              </button>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center">
              <div className="animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-slate-600 dark:text-slate-400">Loading notifications...</p>
            </div>
          )}

          {/* Notifications List */}
          {!loading && filteredNotifications.length > 0 && (
            <div className="space-y-2">
              {filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 transition ${
                    !notification.read
                      ? 'bg-blue-50/50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900'
                      : ''
                  }`}
                >
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 mt-1">
                      {getIcon(notification.type)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-slate-900 dark:text-white mb-1">
                        {notification.message}
                      </p>

                      {notification.post && (
                        <Link
                          href={`/questions/${notification.post_id}`}
                          className="text-sm text-blue-600 dark:text-blue-400 hover:underline block truncate"
                        >
                          {notification.post.title}
                        </Link>
                      )}

                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                        {formatDate(notification.created_at)}
                      </p>
                    </div>

                    <div className="flex-shrink-0 flex items-start gap-2">
                      {!notification.read && (
                        <button
                          onClick={() => markAsRead(notification.id)}
                          className="p-2 text-slate-400 hover:text-green-600 dark:hover:text-green-400 transition"
                          title="Mark as read"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Empty State */}
          {!loading && filteredNotifications.length === 0 && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center">
              <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <Bell className="w-10 h-10 text-slate-400" />
              </div>
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                {filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
              </h2>
              <p className="text-slate-600 dark:text-slate-400">
                {filter === 'unread'
                  ? "You're all caught up!"
                  : "When you get notifications, they'll show up here"}
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default function Notifications() {
  return (
    <PrivateRoute>
      <NotificationsPage />
    </PrivateRoute>
  );
}
