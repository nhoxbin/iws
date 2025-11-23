export function QuestionCardSkeleton() {
  return (
    <div className="bg-card rounded-2xl border border-border shadow-sm p-6 animate-pulse">
      {/* Category Badge */}
      <div className="mb-2">
        <div className="h-6 w-24 bg-muted rounded-full"></div>
      </div>

      {/* Title */}
      <div className="space-y-2 mb-3">
        <div className="h-6 bg-muted rounded w-3/4"></div>
        <div className="h-6 bg-muted rounded w-1/2"></div>
      </div>

      {/* Author & Time */}
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-full bg-muted"></div>
        <div className="flex-1 space-y-1">
          <div className="h-4 bg-muted rounded w-32"></div>
        </div>
      </div>

      {/* Description */}
      <div className="space-y-2 mb-4">
        <div className="h-4 bg-muted rounded"></div>
        <div className="h-4 bg-muted rounded w-5/6"></div>
      </div>

      {/* Tags */}
      <div className="flex gap-2 mb-3">
        <div className="h-7 w-20 bg-muted rounded-full"></div>
        <div className="h-7 w-24 bg-muted rounded-full"></div>
        <div className="h-7 w-16 bg-muted rounded-full"></div>
      </div>

      {/* Answer Count */}
      <div className="h-4 w-24 bg-muted rounded"></div>
    </div>
  );
}

export function SidebarSkeleton() {
  return (
    <div className="bg-card border border-border rounded-xl p-6 animate-pulse">
      <div className="h-5 w-32 bg-muted rounded mb-4"></div>
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex justify-between items-center">
            <div className="h-4 bg-muted rounded w-24"></div>
            <div className="h-4 bg-muted rounded w-8"></div>
          </div>
        ))}
      </div>
    </div>
  );
}
