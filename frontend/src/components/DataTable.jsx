import { Loader2 } from 'lucide-react'

export default function DataTable({ columns, data, loading, emptyMessage = 'Sem dados.' }) {
  if (loading) {
    return (
      <div className="glass-card flex items-center justify-center py-20">
        <Loader2 size={24} className="animate-spin text-accent-green mr-3" />
        <span className="font-body text-text-muted text-sm">A carregar...</span>
      </div>
    )
  }

  return (
    <div className="glass-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(30,41,59,0.8)' }}>
              {columns.map((col) => (
                <th key={col.key}
                  className="text-left px-5 py-3.5 font-body text-xs font-semibold text-text-dim uppercase tracking-widest whitespace-nowrap">
                  {col.label}
                </th>
              ))}
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
              data.map((row, i) => (
                <tr key={row.id ?? i}
                  className="transition-colors duration-150 hover:bg-bg-primary/50"
                  style={{ borderBottom: i < data.length - 1 ? '1px solid rgba(30,41,59,0.4)' : undefined }}>
                  {columns.map((col) => (
                    <td key={col.key} className="px-5 py-3.5 font-body text-sm text-text-primary whitespace-nowrap">
                      {col.render ? col.render(row[col.key], row) : (row[col.key] ?? '—')}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
