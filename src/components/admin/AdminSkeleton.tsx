'use client';

export function AdminSkeleton() {
  return (
    <div className="animate-pulse space-y-6 p-4 md:p-6">
      <div className="flex gap-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="bg-foreground/8 h-24 flex-1 rounded-2xl" />
        ))}
      </div>
      <div className="flex gap-6">
        <div className="bg-foreground/8 hidden h-[420px] w-64 rounded-2xl lg:block" />
        <div className="flex-1 space-y-4">
          <div className="bg-foreground/8 h-12 rounded-xl" />
          <div className="bg-foreground/8 h-40 rounded-2xl" />
          <div className="bg-foreground/8 h-40 rounded-2xl" />
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
