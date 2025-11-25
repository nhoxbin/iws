'use client';

import { Link } from '@/lib/navigation';
import useSWR from 'swr';
import api from '@/lib/api';

interface Contributor {
  id: number;
  name: string;
  answers_count: number;
}

const fetcher = async (url: string) => {
  const response = await api.get(url);
  return response.data.data;
};

export function TopContributors() {
  const { data: contributors, isLoading } = useSWR<Contributor[]>(
    '/users/top-contributors/list?limit=5',
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 300000, // 5 minutes
    }
  );

  if (isLoading) {
    return (
      <div className="bg-card border border-border rounded-xl p-6">
        <div className="h-6 bg-muted rounded w-36 mb-4 animate-pulse" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-muted animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-muted rounded w-24 animate-pulse" />
                <div className="h-3 bg-muted rounded w-16 animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-xl p-6">
      <h3 className="text-foreground font-semibold mb-4">Top Contributors</h3>
      <div className="space-y-4">
        {contributors && contributors.length > 0 ? (
          contributors.map((contributor) => (
            <Link
              key={contributor.id}
              href={`/profile/${contributor.id}`}
              className="flex items-center gap-3 hover:opacity-80 transition"
            >
              <div className="w-10 h-10 rounded-full bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm">
                {contributor.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <div className="text-foreground text-sm font-medium">{contributor.name}</div>
                <div className="text-muted-foreground text-xs">
                  {contributor.answers_count} Answer{contributor.answers_count !== 1 ? 's' : ''}
                </div>
              </div>
            </Link>
          ))
        ) : (
          <p className="text-muted-foreground text-sm">No contributors yet</p>
        )}
      </div>
    </div>
  );
}
