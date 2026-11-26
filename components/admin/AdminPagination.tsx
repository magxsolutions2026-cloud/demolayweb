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
        className="cs-icon-btn !h-8 !w-8 disabled:pointer-events-none disabled:opacity-35"
        disabled={page <= 1}
        onClick={() => onPageChange(Math.max(1, page - 1))}
        aria-label="Previous page"
      >
        <ChevronLeft />
      </button>
      <div className="cs-tabs">
        {pages.map((pageNumber) => (
          <button
            key={pageNumber}
            type="button"
            className="cs-tab-btn"
            onClick={() => onPageChange(pageNumber)}
            aria-current={pageNumber === page ? 'page' : undefined}
          >
            {pageNumber}
          </button>
        ))}
      </div>
      <button
        type="button"
        className="cs-icon-btn !h-8 !w-8 disabled:pointer-events-none disabled:opacity-35"
        disabled={page >= totalPages}
        onClick={() => onPageChange(Math.min(totalPages, page + 1))}
        aria-label="Next page"
      >
        <ChevronRight />
      </button>
    </div>
  );
}
