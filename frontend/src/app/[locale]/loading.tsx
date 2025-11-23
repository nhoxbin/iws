export default function Loading() {
  return (
    <div className="pt-4 pb-20 md:pb-8 px-4 sm:px-6 lg:px-8">
      <div className="animate-pulse">
          <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            <div className="h-32 bg-slate-200 dark:bg-slate-800 rounded"></div>
            <div className="h-32 bg-slate-200 dark:bg-slate-800 rounded"></div>
            <div className="h-32 bg-slate-200 dark:bg-slate-800 rounded"></div>
          </div>
      </div>
    </div>
  );
}
