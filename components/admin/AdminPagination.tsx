'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';

export function AdminPagination({
  page,
  totalPages,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  onPageChange: (p: number) => void;
}) {
  const visibleCount = 5;
  const start = Math.max(1, Math.min(page - 2, totalPages - visibleCount + 1));
  const end = Math.min(totalPages, start + visibleCount - 1);
  const pages = Array.from({ length: end - start + 1 }, (_, index) => start + index);

  return (
    <div className="flex items-center justify-center gap-2 pt-2 sm:justify-end">
      <button
        type="button"
        className="border-gold/20 text-foreground/80 hover:border-gold/40 hover:text-gold flex items-center gap-1 rounded-xl border bg-black/20 px-3 py-2 text-sm font-medium transition duration-200 hover:scale-[1.02] disabled:pointer-events-none disabled:opacity-35"
        disabled={page <= 1}
        onClick={() => onPageChange(Math.max(1, page - 1))}
      >
        <ChevronLeft className="h-4 w-4" aria-hidden />
        Prev
      </button>
      <div className="flex items-center gap-1">
        {pages.map((pageNumber) => {
          const isCurrent = pageNumber === page;
          return (
            <button
              key={pageNumber}
              type="button"
              onClick={() => onPageChange(pageNumber)}
              aria-current={isCurrent ? 'page' : undefined}
              className={`min-w-10 rounded-xl border px-3 py-2 text-sm font-medium transition duration-200 ${
                isCurrent
                  ? 'border-gold/45 bg-gold/15 text-gold'
                  : 'border-gold/15 bg-black/20 text-foreground/75 hover:border-gold/35 hover:text-gold'
              }`}
            >
              {pageNumber}
            </button>
          );
        })}
      </div>
      <button
        type="button"
        className="border-gold/20 text-foreground/80 hover:border-gold/40 hover:text-gold flex items-center gap-1 rounded-xl border bg-black/20 px-3 py-2 text-sm font-medium transition duration-200 hover:scale-[1.02] disabled:pointer-events-none disabled:opacity-35"
        disabled={page >= totalPages}
        onClick={() => onPageChange(Math.min(totalPages, page + 1))}
      >
        Next
        <ChevronRight className="h-4 w-4" aria-hidden />
      </button>
    </div>
  );
}
