'use client';

import { Link } from '@/lib/navigation';
import { usePopularTags } from '@/hooks/use-cached-data';

interface Tag {
  id: number;
  name: string;
  posts_count: number;
}

export function PopularTags() {
  const { tags, isLoading } = usePopularTags();

  if (isLoading) {
    return (
      <div className="bg-card border border-border rounded-xl p-6">
        <div className="h-6 bg-muted rounded w-32 mb-4 animate-pulse" />
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex justify-between items-center">
              <div className="h-4 bg-muted rounded w-24 animate-pulse" />
              <div className="h-3 bg-muted rounded w-8 animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-xl p-6">
      <h3 className="text-foreground font-semibold mb-4">Popular Tags</h3>
      <div className="space-y-2">
        {tags && tags.length > 0 ? (
          tags.map((tag: Tag) => (
            <Link
              key={tag.id}
              href={`/questions?search=${encodeURIComponent(tag.name)}`}
              className="flex justify-between items-center text-muted-foreground text-sm hover:text-primary transition"
            >
              <span>#{tag.name}</span>
              <span className="text-muted-foreground/60 text-xs">{tag.posts_count}</span>
            </Link>
          ))
        ) : (
          <p className="text-muted-foreground text-sm">No tags yet</p>
        )}
      </div>
    </div>
  );
}
