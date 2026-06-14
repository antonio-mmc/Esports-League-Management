import { ChevronLeft, ChevronRight } from 'lucide-react'

// Shared pager used by DataTable (tables) and the Tournaments grid.
// Renders nothing when everything fits on a single page.
export default function Pagination({ page, totalPages, total, pageSize, onPageChange, className = '' }) {
  if (totalPages <= 1) return null

  const start = total === 0 ? 0 : (page - 1) * pageSize + 1
  const end = Math.min(page * pageSize, total)

  return (
    <div className={`flex items-center justify-between gap-4 ${className}`}>
      <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-text-dim">
        {start}–{end} <span className="opacity-50">/ {total}</span>
      </span>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(Math.max(1, page - 1))}
          disabled={page === 1}
          className="inline-flex items-center justify-center h-7 w-7 rounded-md text-text-muted hover:text-text-primary hover:bg-bg-primary disabled:opacity-30 disabled:hover:bg-transparent disabled:cursor-default transition-colors"
          aria-label="Previous page">
          <ChevronLeft size={15} />
        </button>
        <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-text-muted px-2 tabular-nums">
          {page} / {totalPages}
        </span>
        <button
          onClick={() => onPageChange(Math.min(totalPages, page + 1))}
          disabled={page === totalPages}
          className="inline-flex items-center justify-center h-7 w-7 rounded-md text-text-muted hover:text-text-primary hover:bg-bg-primary disabled:opacity-30 disabled:hover:bg-transparent disabled:cursor-default transition-colors"
          aria-label="Next page">
          <ChevronRight size={15} />
        </button>
      </div>
    </div>
  )
}
