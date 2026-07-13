import { ChevronDown } from 'lucide-react';

export function Pagination({ pagination, onPageChange, onLimitChange }) {
  const { total, page, limit, totalPages, hasNext, hasPrev } = pagination;

  const pages = [];
  const maxButtons = 5;
  const startPage = Math.max(1, page - Math.floor(maxButtons / 2));
  const endPage = Math.min(totalPages, startPage + maxButtons - 1);

  for (let current = startPage; current <= endPage; current += 1) {
    pages.push(current);
  }

  return (
    <div className="flex flex-col gap-4 rounded-3xl bg-white px-6 py-4 text-sm text-text-secondary shadow-sm border border-border md:flex-row md:items-center md:justify-between">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => onPageChange(1)}
          disabled={!hasPrev}
          className="rounded-full border border-border px-4 py-2 text-sm transition disabled:opacity-40"
        >
          {'<<'}
        </button>
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={!hasPrev}
          className="rounded-full border border-border px-4 py-2 text-sm transition disabled:opacity-40"
        >
          {'<'}
        </button>
        {pages.map((pageNumber) => (
          <button
            key={pageNumber}
            type="button"
            onClick={() => onPageChange(pageNumber)}
            className={`rounded-full px-4 py-2 text-sm transition ${pageNumber === page ? 'bg-rose text-white' : 'border border-border bg-white text-text-primary hover:bg-rose-light'}`}
          >
            {pageNumber}
          </button>
        ))}
        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={!hasNext}
          className="rounded-full border border-border px-4 py-2 text-sm transition disabled:opacity-40"
        >
          {'>'}
        </button>
        <button
          type="button"
          onClick={() => onPageChange(totalPages)}
          disabled={!hasNext}
          className="rounded-full border border-border px-4 py-2 text-sm transition disabled:opacity-40"
        >
          {'>>'}
        </button>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <span className="shrink-0">Total: {total}</span>
        <label className="flex shrink-0 items-center gap-2">
          <span className="shrink-0">Items por página:</span>
          <span className="relative inline-block">
            <select
              value={limit}
              onChange={(event) => onLimitChange(Number(event.target.value))}
              className="appearance-none rounded-2xl border border-border-input bg-white py-2 pl-3 pr-8 text-sm outline-none focus:border-rose focus:ring-2 focus:ring-rose/20"
            >
              {[10, 25, 50].map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" />
          </span>
        </label>
      </div>
    </div>
  );
}

export default Pagination;
