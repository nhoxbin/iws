import { getRequestConfig } from 'next-intl/server';
import { locales, type Locale } from './lib/i18n';

export default getRequestConfig(async ({ locale }) => {
  // Use default locale if the requested one is not supported
  const validLocale: string = locales.includes(locale as Locale) ? (locale as string) : 'en';

  return {
    locale: validLocale,
    messages: (await import(`../public/locales/${validLocale}/common.json`)).default
  };
});
