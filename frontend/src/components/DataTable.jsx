import { useState, useEffect, useMemo } from 'react'
import { Loader2, ChevronsUpDown, ChevronUp, ChevronDown } from 'lucide-react'
import Pagination from './Pagination'

export default function DataTable({ columns, data, loading, emptyMessage = 'No data.', highlightFn, sortKey, sortDir, onSort, onRowClick, pageSize = 10 }) {
  const [page, setPage] = useState(1)

  const total = data.length
  const totalPages = Math.max(1, Math.ceil(total / pageSize))

  // Clamp current page whenever the dataset shrinks (e.g. filtering)
  useEffect(() => {
    if (page > totalPages) setPage(totalPages)
  }, [page, totalPages])

  const pageData = useMemo(() => {
    const start = (page - 1) * pageSize
    return data.slice(start, start + pageSize)
  }, [data, page, pageSize])

  if (loading) {
    return (
      <div className="glass-card flex items-center justify-center py-20">
        <Loader2 size={20} className="animate-spin text-accent-green mr-3" />
        <span className="font-mono text-text-muted text-xs uppercase tracking-wider">Loading</span>
      </div>
    )
  }

  return (
    <div className="glass-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-bg-border">
              {columns.map((col) => {
                const active = sortKey === col.key
                const SortIcon = active ? (sortDir === 'asc' ? ChevronUp : ChevronDown) : ChevronsUpDown
                return (
                  <th key={col.key}
                    className={`text-left px-5 py-3 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] whitespace-nowrap select-none ${
                      col.sortable ? 'cursor-pointer hover:text-text-muted transition-colors' : ''
                    } ${active ? 'text-text-primary' : 'text-text-dim'}`}
                    onClick={() => col.sortable && onSort?.(col.key)}>
                    <span className="inline-flex items-center gap-1.5">
                      {col.label}
                      {col.sortable && <SortIcon size={11} className={active ? 'text-accent-green' : 'opacity-30'} />}
                    </span>
                  </th>
                )
              })}
            </tr>
          </thead>
          <tbody>
            {pageData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="text-center py-16 font-mono text-xs uppercase tracking-wider text-text-dim">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              pageData.map((row, i) => {
                const highlighted = highlightFn ? highlightFn(row) : false
                return (
                  <tr key={row.id ?? i}
                    onClick={onRowClick ? () => onRowClick(row) : undefined}
                    className={`transition-colors duration-150 ${onRowClick ? 'cursor-pointer' : ''} ${highlighted ? 'hover:bg-accent-green/[0.06]' : 'hover:bg-bg-primary'}`}
                    style={{
                      borderBottom: i < pageData.length - 1 ? '1px solid rgb(var(--bg-border) / 0.6)' : undefined,
                      ...(highlighted ? {
                        background:  'rgba(34,197,94,0.05)',
                        boxShadow:   'inset 2px 0 0 #22C55E',
                      } : {}),
                    }}>
                    {columns.map((col) => (
                      <td key={col.key} className="px-5 py-3 font-body text-sm text-text-primary whitespace-nowrap">
                        {col.render ? col.render(row[col.key], row) : (row[col.key] ?? '—')}
                      </td>
                    ))}
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      <Pagination
        page={page}
        totalPages={totalPages}
        total={total}
        pageSize={pageSize}
        onPageChange={setPage}
        className="px-5 py-3 border-t border-bg-border"
      />
    </div>
  )
}
