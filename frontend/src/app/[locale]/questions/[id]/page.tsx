import { Metadata } from 'next';
import QuestionDetailClient from './question-detail-client';

interface PageProps {
  params: Promise<{ id: string; locale: string }>;
}

async function getQuestionData(id: string) {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    const response = await fetch(`${apiUrl}/api/posts/${id}`, {
      next: { revalidate: 60 }, // Revalidate every minute
    });

    if (!response.ok) {
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching question:', error);
    return null;
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const question = await getQuestionData(id);

  if (!question) {
    return {
      title: 'Question Not Found',
      description: 'The requested question could not be found.',
    };
  }

  const title = question.title;
  const description = question.content
    ? question.content.substring(0, 160).replace(/<[^>]*>/g, '') // Strip HTML tags
    : 'Read and answer this interview question on Interview Wisdom Share';

  const tags = question.tags?.map((t: any) => t.name) || [];
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://iws-inky.vercel.app';

  return {
    title,
    description,
    keywords: ['interview question', ...tags, 'job interview', 'career advice'],
    openGraph: {
      title,
      description,
      type: 'article',
      publishedTime: question.created_at,
      modifiedTime: question.updated_at,
      authors: [question.user?.name || 'Anonymous'],
      tags,
      url: `${baseUrl}/questions/${id}`,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
    alternates: {
      canonical: `${baseUrl}/questions/${id}`,
    },
  };
}

export default function QuestionDetailPage({ params }: PageProps) {
  return <QuestionDetailClient />;
}
