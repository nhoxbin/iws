'use client';

import { useState, memo } from 'react';
import { useAuthStore } from '@/lib/auth-store';
import { Search, Bell, Home, HelpCircle, Bookmark, BarChart3, ChevronDown, User, LogOut } from 'lucide-react';
import { Link, useRouter, usePathname } from '@/lib/navigation';
import api from '@/lib/api';
import { useNotifications } from '@/hooks/use-cached-data';

interface MenuItem {
  label: string;
  icon: React.ReactNode;
  href: string;
}

interface AppHeaderProps {
  menuItems?: MenuItem[];
  showSearch?: boolean;
}

const defaultMenuItems: MenuItem[] = [
  { label: 'Home', icon: <Home className="w-5 h-5" />, href: '/dashboard' },
  { label: 'My Questions', icon: <HelpCircle className="w-5 h-5" />, href: '/my-questions' },
  { label: 'Saved', icon: <Bookmark className="w-5 h-5" />, href: '/saved' },
  { label: 'Leaderboard', icon: <BarChart3 className="w-5 h-5" />, href: '/leaderboard' },
];

function AppHeaderComponent({ menuItems = defaultMenuItems, showSearch = true }: AppHeaderProps) {
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [isAvatarDropdownOpen, setIsAvatarDropdownOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Use SWR cached hook for notifications (auto-refreshes every 30 seconds)
  const { notifications, unreadCount, isLoading: notificationsLoading, mutate: mutateNotifications } = useNotifications(5);

  const handleNotificationClick = () => {
    setIsNotificationOpen(!isNotificationOpen);
  };

  const markAsRead = async (id: number) => {
    try {
      await api.post(`/notifications/${id}/read`);
      // Revalidate notifications cache
      mutateNotifications();
    } catch (error) {
      console.error('Error marking notification as read:', error);
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

  // SWR automatically handles polling and revalidation

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const toggleSearch = () => {
    setIsSearchExpanded(!isSearchExpanded);
    if (isSearchExpanded) {
      setSearchQuery('');
    }
  };

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/questions?search=${encodeURIComponent(searchQuery)}`);
      setIsSearchExpanded(false);
      setSearchQuery('');
    }
  };

  const handleSearchInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
  };

  return (
    <>
      {/* Desktop: Minimal Left Sidebar - Just Logo and IWS */}
      <aside className="hidden md:flex fixed left-0 top-0 h-screen w-20 bg-slate-100 dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 z-50 justify-center">
        <Link href="/dashboard" className="flex flex-col items-center gap-2 py-4">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-xl">📝</span>
          </div>
          <span className="text-slate-900 dark:text-white font-semibold text-sm">IWS</span>
        </Link>
      </aside>

      {/* Mobile: Logo Top Left */}
      <div className="md:hidden fixed top-0 left-0 z-50 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 w-full">
        <div className="flex items-center justify-between h-14 px-4">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">📝</span>
            </div>
            <span className="text-slate-900 dark:text-white font-semibold text-sm">IWS</span>
          </Link>

          {/* Mobile Top Right Actions */}
          <div className="flex items-center gap-2">
            {showSearch && (
              <button
                onClick={toggleSearch}
                className="p-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                title="Search"
              >
                <Search className="w-5 h-5" />
              </button>
            )}
            <button
              onClick={handleNotificationClick}
              className="relative p-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Desktop: Top Header with Menu */}
      <header className="hidden md:block fixed top-0 left-20 right-0 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 z-40">
        <div className="flex items-center justify-between h-16 px-6">
          {/* Left: Navigation Menu */}
          <nav className="flex items-center gap-1">
            {menuItems.map((item) => {
              // next-intl's usePathname already returns path without locale
              // For dashboard, only match exact path. For others, match if path starts with href
              const isActive = item.href === '/dashboard'
                ? pathname === item.href || pathname === '' || pathname === '/'
                : pathname === item.href || pathname?.startsWith(item.href + '/');
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  prefetch={true}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                    isActive
                      ? 'text-white bg-blue-600 dark:bg-blue-600'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                  title={item.label}
                >
                  {item.icon}
                  <span className="hidden lg:inline">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right: Search, Notifications, Avatar */}
          <div className="flex items-center gap-4">
            {showSearch && (
              <button
                onClick={toggleSearch}
                className="p-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
                title="Search"
              >
                <Search className="w-5 h-5" />
              </button>
            )}

            <div className="relative">
              <button
                onClick={handleNotificationClick}
                className="relative p-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Panel */}
              {isNotificationOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsNotificationOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-96 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg z-50 max-h-[32rem] overflow-hidden flex flex-col">
                    <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Notifications</h3>
                      {unreadCount > 0 && (
                        <span className="text-xs text-slate-500 dark:text-slate-400">{unreadCount} unread</span>
                      )}
                    </div>

                    <div className="overflow-y-auto flex-1">
                      {notificationsLoading ? (
                        <div className="p-8 text-center">
                          <div className="animate-spin w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full mx-auto mb-2"></div>
                          <p className="text-sm text-slate-500 dark:text-slate-400">Loading...</p>
                        </div>
                      ) : notifications.length > 0 ? (
                        <div className="divide-y divide-slate-200 dark:divide-slate-700">
                          {notifications.map((notification: { id: number; type: string; message: string; post_id: number | null; read: boolean; created_at: string; post?: { id: number; title: string } }) => (
                            <div
                              key={notification.id}
                              className={`p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition cursor-pointer ${
                                !notification.read ? 'bg-blue-50/50 dark:bg-blue-950/20' : ''
                              }`}
                              onClick={() => {
                                if (!notification.read) {
                                  markAsRead(notification.id);
                                }
                                if (notification.post_id) {
                                  router.push(`/questions/${notification.post_id}`);
                                  setIsNotificationOpen(false);
                                }
                              }}
                            >
                              <div className="flex gap-2 items-start">
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm text-slate-900 dark:text-white mb-1">
                                    {notification.message}
                                  </p>
                                  {notification.post && (
                                    <p className="text-xs text-blue-600 dark:text-blue-400 truncate">
                                      {notification.post.title}
                                    </p>
                                  )}
                                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                    {formatDate(notification.created_at)}
                                  </p>
                                </div>
                                {!notification.read && (
                                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-1.5 flex-shrink-0"></div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-8 text-center">
                          <Bell className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                          <p className="text-sm text-slate-500 dark:text-slate-400">No notifications yet</p>
                        </div>
                      )}
                    </div>

                    <div className="px-4 py-3 border-t border-slate-200 dark:border-slate-700">
                      <Link
                        href="/notifications"
                        onClick={() => setIsNotificationOpen(false)}
                        className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium text-center block"
                      >
                        Show All
                      </Link>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Avatar Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsAvatarDropdownOpen(!isAvatarDropdownOpen)}
                className="flex items-center gap-2 group"
              >
                <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-900 dark:text-white cursor-pointer hover:ring-2 hover:ring-blue-500 transition">
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <ChevronDown className="w-4 h-4 text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition" />
              </button>

              {/* Dropdown Menu */}
              {isAvatarDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsAvatarDropdownOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg py-2 z-50">
                    <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700">
                      <p className="text-sm font-medium text-slate-900 dark:text-white">
                        {user?.name || 'User'}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                        {user?.email || ''}
                      </p>
                    </div>
                    <Link
                      href="/saved"
                      onClick={() => setIsAvatarDropdownOpen(false)}
                      className="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition"
                    >
                      <Bookmark className="w-4 h-4" />
                      Saved
                    </Link>
                    <Link
                      href="/my-questions"
                      onClick={() => setIsAvatarDropdownOpen(false)}
                      className="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition"
                    >
                      <HelpCircle className="w-4 h-4" />
                      My Questions
                    </Link>
                    <Link
                      href="/profile"
                      onClick={() => setIsAvatarDropdownOpen(false)}
                      className="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition"
                    >
                      <User className="w-4 h-4" />
                      Profile
                    </Link>
                    <div className="border-t border-slate-200 dark:border-slate-700 my-2" />
                    <button
                      onClick={() => {
                        setIsAvatarDropdownOpen(false);
                        handleLogout();
                      }}
                      className="flex items-center gap-3 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-slate-50 dark:hover:bg-slate-700 transition w-full text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile: Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 z-50">
        <div className="flex items-center justify-around h-16 px-2">
          {menuItems.map((item) => {
            // next-intl's usePathname already returns path without locale
            // For dashboard, only match exact path. For others, match if path starts with href
            const isActive = item.href === '/dashboard'
              ? pathname === item.href || pathname === '' || pathname === '/'
              : pathname === item.href || pathname?.startsWith(item.href + '/');
            return (
              <Link
                key={item.href}
                href={item.href}
                prefetch={true}
                className={`flex flex-col items-center justify-center flex-1 py-2 transition ${
                  isActive
                    ? 'text-blue-600 dark:text-blue-400 font-semibold'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
                title={item.label}
              >
                {item.icon}
                <span className="text-xs mt-1">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Expanded Search - Slides down from top */}
      {isSearchExpanded && (
        <>
          <div className="fixed inset-0 z-[45] bg-transparent" onClick={toggleSearch} />
          <div
            className="fixed top-14 md:top-16 left-0 md:left-20 right-0 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-lg z-50 animate-slideDown"
          >
            <form onSubmit={handleSearchSubmit} className="p-4 md:p-6">
              <div className="relative max-w-3xl mx-auto">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-500 w-5 h-5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={handleSearchInput}
                  placeholder="Search questions or topics..."
                  autoFocus
                  className="w-full pl-12 pr-20 py-3 md:py-4 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') {
                      toggleSearch();
                    } else if (e.key === 'Enter') {
                      handleSearchSubmit();
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={toggleSearch}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 px-3 py-1 text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 bg-slate-200 dark:bg-slate-700 rounded"
                >
                  ESC
                </button>
              </div>
            </form>
          </div>
        </>
      )}
    </>
  );
}

export const AppHeader = memo(AppHeaderComponent);
