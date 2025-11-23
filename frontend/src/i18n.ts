import { getRequestConfig } from 'next-intl/server';

// Can be imported from a shared config
const locales = ['en', 'vi'] as const;
type Locale = (typeof locales)[number];

export default getRequestConfig(async ({ locale }) => {
  // Use default locale if the requested one is not supported
  const validLocale: string = locales.includes(locale as Locale) ? (locale as string) : 'en';

  return {
    locale: validLocale,
    messages: (await import(`../public/locales/${validLocale}/common.json`)).default
  };
});
