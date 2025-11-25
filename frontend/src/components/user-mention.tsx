import { useState, useEffect } from 'react';
import api from '@/lib/api';

interface User {
  id: number;
  name: string;
  email: string;
  role?: string;
}

interface UserMentionProps {
  onSelect: (user: User) => void;
  searchTerm: string;
}

export function UserMention({ onSelect, searchTerm }: UserMentionProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    if (searchTerm.length < 2) {
      setUsers([]);
      return;
    }

    const fetchUsers = async () => {
      setLoading(true);
      try {
        const response = await api.get(`/users/search?q=${searchTerm}`);
        setUsers(response.data.data || []);
        setSelectedIndex(0);
      } catch (error) {
        console.error('Error fetching users:', error);
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(fetchUsers, 300);
    return () => clearTimeout(debounce);
  }, [searchTerm]);

  if (!searchTerm || users.length === 0) return null;

  return (
    <div className="absolute bottom-full left-0 mb-2 w-64 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg max-h-48 overflow-y-auto z-50">
      {loading ? (
        <div className="p-3 text-center text-slate-500 dark:text-slate-400 text-sm">
          Searching...
        </div>
      ) : (
        <>
          {users.map((user, index) => (
            <button
              key={user.id}
              onClick={() => onSelect(user)}
              className={`w-full px-3 py-2 text-left hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2 ${
                index === selectedIndex ? 'bg-slate-100 dark:bg-slate-700' : ''
              }`}
            >
              <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-slate-900 dark:text-white truncate">
                  {user.name}
                </div>
                {user.role && (
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    {user.role}
                  </div>
                )}
              </div>
            </button>
          ))}
        </>
      )}
    </div>
  );
}
