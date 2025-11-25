interface Contributor {
  id: number;
  name: string;
  answers_count: number;
  avatar?: string;
}

interface TopContributorsProps {
  contributors?: Contributor[];
  loading?: boolean;
}

export function TopContributors({ contributors, loading = false }: TopContributorsProps) {
  // Mock data if no contributors provided
  const defaultContributors: Contributor[] = [
    { id: 1, name: 'Alex Smith', answers_count: 128 },
    { id: 2, name: 'Maria Garcia', answers_count: 97 },
    { id: 3, name: 'Ken Tanaka', answers_count: 85 },
  ];

  const displayContributors = contributors || defaultContributors;

  if (loading) {
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
        {displayContributors.map((contributor) => (
          <div key={contributor.id} className="flex items-center gap-3">
            {contributor.avatar ? (
              <img
                src={contributor.avatar}
                alt={contributor.name}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm">
                {contributor.name.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="flex-1">
              <div className="text-foreground text-sm font-medium">{contributor.name}</div>
              <div className="text-muted-foreground text-xs">
                {contributor.answers_count} Answer{contributor.answers_count !== 1 ? 's' : ''}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
