export function Table({ columns, data, isLoading, emptyMessage = 'No hay resultados', children, onRowClick }) {
  return (
    <div className="overflow-x-auto rounded-3xl border border-border bg-white shadow-sm">
      <table className="min-w-full border-separate border-spacing-0 text-left text-sm">
        <thead className="bg-rose-light/60">
          <tr>
            {columns.map((column) => (
              <th key={column.key} className="border-b border-border px-4 py-4 text-xs font-semibold uppercase tracking-[0.12em] text-text-secondary">
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {isLoading && Array.from({ length: 5 }).map((_, index) => (
            <tr key={index} className="animate-pulse bg-white">
              {columns.map((column) => (
                <td key={column.key} className="border-b border-border px-4 py-4">
                  <div className="h-4 w-full rounded bg-slate-200" />
                </td>
              ))}
            </tr>
          ))}
          {!isLoading && data.length === 0 && (
            <tr>
              <td colSpan={columns.length} className="px-4 py-10 text-center text-sm text-text-secondary">
                {children || emptyMessage}
              </td>
            </tr>
          )}
          {!isLoading && data.map((row, rowIndex) => (
            <tr
              key={rowIndex}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
              className={`border-b border-border last:border-b-0 hover:bg-rose-light/30 ${onRowClick ? 'cursor-pointer' : ''}`}
            >
              {columns.map((column) => (
                <td key={column.key} className="px-4 py-4 align-top text-sm text-text-primary">
                  {column.render ? column.render(row) : row[column.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Table;
