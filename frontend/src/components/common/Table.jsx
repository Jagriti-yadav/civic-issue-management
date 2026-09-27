export function Table({ columns, data, loading = false, emptyState = null, onRowClick = null }) {
  if (loading) {
    return (
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-civic-border">
              {columns.map((col, i) => (
                <th
                  key={i}
                  className="text-left text-sm font-medium text-civic-text-secondary px-4 py-3"
                  style={col.width ? { width: col.width } : {}}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[...Array(5)].map((_, i) => (
              <tr key={i} className="border-b border-civic-border">
                {columns.map((_, j) => (
                  <td key={j} className="px-4 py-3.5">
                    <div className="h-4 bg-slate-200/70 rounded animate-pulse" style={{ width: `${60 + Math.random() * 30}%` }} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-civic-border">
              {columns.map((col, i) => (
                <th key={i} className="text-left text-sm font-medium text-civic-text-secondary px-4 py-3">
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
        </table>
        {emptyState || (
          <p className="text-center text-sm text-civic-text-secondary py-12">No data available</p>
        )}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto scrollbar-thin">
      <table className="w-full">
        <thead>
          <tr className="border-b border-civic-border bg-civic-bg/50">
            {columns.map((col, i) => (
              <th
                key={i}
                className={`text-${col.align || 'left'} text-sm font-medium text-civic-text-secondary px-4 py-3 whitespace-nowrap`}
                style={col.width ? { width: col.width } : {}}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr
              key={row._id || i}
              onClick={() => onRowClick?.(row)}
              className={`border-b border-civic-border last:border-0 transition-colors ${
                onRowClick ? 'cursor-pointer hover:bg-civic-hover' : ''
              }`}
            >
              {columns.map((col, j) => (
                <td key={j} className={`text-${col.align || 'left'} px-4 py-3.5 text-sm text-civic-text-primary`}>
                  {col.render ? col.render(row) : col.key ? row[col.key] : null}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
