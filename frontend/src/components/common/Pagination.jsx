import { ChevronLeft, ChevronRight } from 'lucide-react';

export function Pagination({ page, totalPages, limit, total, onPageChange }) {
  if (totalPages <= 1) return null;

  const start = (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);

  const getPages = () => {
    const pages = [];
    const maxVisible = 5;
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      const half = Math.floor(maxVisible / 2);
      let startPage = Math.max(1, page - half);
      let endPage = Math.min(totalPages, startPage + maxVisible - 1);
      if (endPage - startPage < maxVisible - 1) {
        startPage = Math.max(1, endPage - maxVisible + 1);
      }
      if (startPage > 1) {
        pages.push(1);
        if (startPage > 2) pages.push('...');
      }
      for (let i = startPage; i <= endPage; i++) pages.push(i);
      if (endPage < totalPages) {
        if (endPage < totalPages - 1) pages.push('...');
        pages.push(totalPages);
      }
    }
    return pages;
  };

  return (
    <div className="flex items-center justify-between gap-4 flex-wrap">
      <p className="text-sm text-civic-text-secondary">
        Showing <span className="font-medium text-civic-text-primary">{start}</span>–
        <span className="font-medium text-civic-text-primary">{end}</span> of{' '}
        <span className="font-medium text-civic-text-primary">{total}</span>
      </p>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="p-2 rounded-lg text-civic-text-secondary hover:bg-civic-hover hover:text-civic-text-primary disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
          aria-label="Previous page"
        >
          <ChevronLeft size={18} />
        </button>
        {getPages().map((p, i) =>
          typeof p === 'number' ? (
            <button
              key={i}
              onClick={() => onPageChange(p)}
              className={`min-w-[36px] h-9 px-2 rounded-lg text-sm font-medium transition-colors ${
                p === page
                  ? 'bg-civic-blue text-white'
                  : 'text-civic-text-secondary hover:bg-civic-hover'
              }`}
              aria-current={p === page ? 'page' : undefined}
            >
              {p}
            </button>
          ) : (
            <span key={i} className="px-2 text-civic-muted text-sm">
              {p}
            </span>
          )
        )}
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="p-2 rounded-lg text-civic-text-secondary hover:bg-civic-hover hover:text-civic-text-primary disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
          aria-label="Next page"
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}
