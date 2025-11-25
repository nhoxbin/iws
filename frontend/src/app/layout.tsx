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
  title: "Interview Wisdom Share",
  description: "App for people who want to ask about interview questions. Built with Next.js, Laravel. AI Supported.",
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
