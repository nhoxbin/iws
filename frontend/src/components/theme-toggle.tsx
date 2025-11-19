'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/lib/theme-context';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="relative w-14 h-7 rounded-full bg-slate-300 dark:bg-slate-700 transition-colors flex items-center px-1"
      aria-label="Toggle theme"
    >
      <div
        className={`w-5 h-5 rounded-full bg-white dark:bg-slate-900 shadow-md transform transition-transform duration-200 flex items-center justify-center ${
          theme === 'dark' ? 'translate-x-7' : 'translate-x-0'
        }`}
      >
        {theme === 'light' ? (
          <Sun className="w-3 h-3 text-yellow-500" />
        ) : (
          <Moon className="w-3 h-3 text-blue-400" />
        )}
      </div>
    </button>
  );
}
