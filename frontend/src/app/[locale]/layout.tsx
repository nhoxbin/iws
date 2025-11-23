import { Suspense } from 'react';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { locales, Locale } from '@/lib/i18n';
import { SWRProvider } from '@/components/swr-provider';
import { NavigationListener } from '@/components/navigation-listener';
import { SPADebugger } from '@/components/spa-debugger';
import { NavigationProgress } from '@/components/navigation-progress';
import { AppHeader } from '@/components/app-header';
import Loading from './loading';

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // Validate that the incoming `locale` parameter is valid
  if (!locales.includes(locale as Locale)) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <NextIntlClientProvider messages={messages} locale={locale}>
      <SWRProvider>
        <NavigationListener />
        <NavigationProgress />
        <SPADebugger />
        <div className="min-h-screen bg-background">
          {/* AppHeader stays cached here - outside Suspense, outside page component tree */}
          <AppHeader />
          <Suspense fallback={<Loading />}>
            <main className="md:ml-20 mt-14 md:mt-16">
              {children}
            </main>
          </Suspense>
        </div>
      </SWRProvider>
    </NextIntlClientProvider>
  );
}
