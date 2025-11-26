import { Metadata } from 'next';
import QuestionDetailClient from './question-detail-client';

interface PageProps {
  params: Promise<{ id: string; locale: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://iws-inky.vercel.app';

  return {
    title: 'Interview Question',
    description: 'Read and answer interview questions on Interview Wisdom Share',
    keywords: ['interview question', 'job interview', 'career advice'],
    openGraph: {
      title: 'Interview Question',
      description: 'Read and answer interview questions on Interview Wisdom Share',
      type: 'article',
      url: `${baseUrl}/questions/${id}`,
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Interview Question',
      description: 'Read and answer interview questions on Interview Wisdom Share',
    },
    alternates: {
      canonical: `${baseUrl}/questions/${id}`,
    },
  };
}

export default function QuestionDetailPage({ params }: PageProps) {
  return <QuestionDetailClient />;
}
