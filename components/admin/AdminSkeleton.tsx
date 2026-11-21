'use client';

export function AdminSkeleton() {
  return (
    <div className="animate-pulse flex min-h-0 flex-1">
      <div className="bg-foreground/5 hidden w-[248px] shrink-0 border-r border-white/5 lg:block" />
      <div className="min-w-0 flex-1 space-y-6 p-4 md:p-8">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-foreground/8 h-28 rounded-2xl" />
          ))}
        </div>
        <div className="bg-foreground/8 h-12 rounded-xl" />
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-foreground/8 h-20 rounded-2xl" />
          ))}
        </div>
      </div>
    </div>
  );
}

export function TableRowSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="animate-pulse space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="bg-foreground/8 flex h-20 rounded-2xl" />
      ))}
    </div>
  );
}
