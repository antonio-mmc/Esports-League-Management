import { Loader2, ChevronsUpDown, ChevronUp, ChevronDown } from 'lucide-react'

export default function DataTable({ columns, data, loading, emptyMessage = 'No data.', highlightFn, sortKey, sortDir, onSort }) {
  if (loading) {
    return (
      <div className="glass-card flex items-center justify-center py-20">
        <Loader2 size={24} className="animate-spin text-accent-green mr-3" />
        <span className="font-body text-text-muted text-sm">Loading...</span>
      </div>
    )
  }

  return (
    <div className="glass-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(30,41,59,0.8)' }}>
              {columns.map((col) => {
                const active = sortKey === col.key
                const SortIcon = active ? (sortDir === 'asc' ? ChevronUp : ChevronDown) : ChevronsUpDown
                return (
                  <th key={col.key}
                    className={`text-left px-5 py-3.5 font-body text-xs font-semibold uppercase tracking-widest whitespace-nowrap select-none ${
                      col.sortable ? 'cursor-pointer' : ''
                    } ${active ? 'text-text-muted' : 'text-text-dim'}`}
                    onClick={() => col.sortable && onSort?.(col.key)}>
                    <span className="inline-flex items-center gap-1">
                      {col.label}
                      {col.sortable && <SortIcon size={11} className={active ? 'opacity-90' : 'opacity-30'} />}
                    </span>
                  </th>
                )
              })}
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="text-center py-16 font-body text-sm text-text-dim">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((row, i) => {
                const highlighted = highlightFn ? highlightFn(row) : false
                return (
                  <tr key={row.id ?? i}
                    className={`transition-colors duration-150 ${highlighted ? 'hover:bg-accent-green/5' : 'hover:bg-bg-primary/50'}`}
                    style={{
                      borderBottom: i < data.length - 1 ? '1px solid rgba(30,41,59,0.4)' : undefined,
                      ...(highlighted ? {
                        background:  'rgba(34,197,94,0.04)',
                        borderLeft:  '2px solid rgba(34,197,94,0.35)',
                      } : {}),
                    }}>
                    {columns.map((col) => (
                      <td key={col.key} className="px-5 py-3.5 font-body text-sm text-text-primary whitespace-nowrap">
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
    </div>
  )
}
