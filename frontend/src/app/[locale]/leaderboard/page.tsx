import { Metadata } from 'next';
import LeaderboardClient from './leaderboard-client';
import PrivateRoute from '@/components/private-route';

export const metadata: Metadata = {
  title: 'Leaderboard',
  description: 'See who\'s making the biggest impact in our interview questions community. View top contributors by reputation, answers, and upvotes.',
  keywords: ['leaderboard', 'top contributors', 'reputation', 'community rankings'],
  openGraph: {
    title: 'Community Leaderboard',
    description: 'Discover the top contributors in our interview questions community.',
    type: 'website',
  },
};

export default function Leaderboard() {
  return (
    <PrivateRoute>
      <LeaderboardClient />
    </PrivateRoute>
  );
}
