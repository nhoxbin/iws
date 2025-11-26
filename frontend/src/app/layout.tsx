import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/lib/theme-context";
import { GoogleAnalytics } from "@next/third-parties/google";
import { Analytics } from "@vercel/analytics/next"
import { SpeedInsights } from "@vercel/speed-insights/next"
import { Toaster } from "sonner"
import { ConfirmDialogProvider } from "@/components/confirm-dialog"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'https://iws-inky.vercel.app'),
  title: {
    default: 'Interview Wisdom Share - Ask & Share Interview Questions',
    template: '%s | Interview Wisdom Share',
  },
  description: 'Community platform for sharing interview questions and answers. Get help preparing for your next job interview with AI-powered insights and expert advice from experienced professionals.',
  keywords: [
    'interview questions',
    'job interview',
    'career advice',
    'interview preparation',
    'coding interview',
    'technical interview',
    'interview tips',
    'job search',
    'career development',
    'interview practice',
  ],
  authors: [{ name: 'Interview Wisdom Share' }],
  creator: 'Interview Wisdom Share',
  publisher: 'Interview Wisdom Share',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://iws-inky.vercel.app',
    siteName: 'Interview Wisdom Share',
    title: 'Interview Wisdom Share - Ask & Share Interview Questions',
    description: 'Community platform for sharing interview questions and answers. Get help preparing for your next job interview with AI-powered insights.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Interview Wisdom Share',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Interview Wisdom Share - Ask & Share Interview Questions',
    description: 'Community platform for sharing interview questions and answers with AI-powered insights.',
    images: ['/twitter-image.png'],
    creator: '@interviewwisdom',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: 'https://iws-inky.vercel.app',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html suppressHydrationWarning lang="en">
      <head>
        <meta name="view-transition" content="same-origin" />
        <meta name="color-scheme" content="light dark" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-slate-50 dark:bg-slate-950`}
      >
        <ThemeProvider>
          <ConfirmDialogProvider>
            <Toaster position="bottom-right" richColors closeButton />
            {children}
          </ConfirmDialogProvider>
        </ThemeProvider>
        {process.env.NODE_ENV === 'production' && (
          <>
            {process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID && (
              <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID} />
            )}
            <Analytics />
            <SpeedInsights />
          </>
        )}
      </body>
    </html>
  );
}
