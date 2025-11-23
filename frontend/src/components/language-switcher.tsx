'use client';

import { useRouter, usePathname } from '@/lib/navigation';
import { Globe } from 'lucide-react';
import { useState, useTransition } from 'react';
import { Locale } from '@/lib/i18n';

const languages = [
  { code: 'en' as Locale, name: 'English', flag: '🇺🇸' },
  { code: 'vi' as Locale, name: 'Tiếng Việt', flag: '🇻🇳' },
];

export function LanguageSwitcher({ locale }: { locale: Locale }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const currentLang = languages.find(lang => lang.code === locale) || languages[0];

  const changeLanguage = (newLocale: Locale) => {
    startTransition(() => {
      // next-intl's usePathname already returns path without locale
      // Just use router.replace with locale option
      router.replace(pathname, { locale: newLocale });
      setIsOpen(false);
    });
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isPending}
        className="flex items-center gap-2 p-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition disabled:opacity-50"
        title="Change language"
      >
        <Globe className="w-5 h-5" />
        <span className="hidden lg:inline text-sm">{currentLang.flag} {currentLang.code.toUpperCase()}</span>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg py-2 z-50">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => changeLanguage(lang.code)}
                disabled={isPending}
                className={`w-full flex items-center gap-3 px-4 py-2 text-sm transition disabled:opacity-50 ${
                  locale === lang.code
                    ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                }`}
              >
                <span className="text-xl">{lang.flag}</span>
                <span>{lang.name}</span>
                {locale === lang.code && (
                  <span className="ml-auto text-blue-600 dark:text-blue-400">✓</span>
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
