import { Metadata } from 'next';
import QuestionsClient from './questions-client';

export const metadata: Metadata = {
  title: 'All Questions',
  description: 'Browse interview questions from our community. Find answers to common interview questions, share your knowledge, and help others prepare for their job interviews.',
  keywords: ['interview questions', 'job interview', 'Q&A', 'career help', 'job preparation'],
  openGraph: {
    title: 'Interview Questions - Browse & Answer',
    description: 'Browse interview questions from our community and share your expertise.',
    type: 'website',
  },
};

export default function QuestionsPage() {
  return <QuestionsClient />;
}
