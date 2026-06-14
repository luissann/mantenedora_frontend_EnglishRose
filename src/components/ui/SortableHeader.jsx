import { ArrowDown, ArrowUpDown } from 'lucide-react';

export function SortableHeader({ label, sortKey, currentSort, onSort }) {
  const active = currentSort?.key === sortKey;
  const direction = active ? currentSort?.dir : null;

  return (
    <button
      type="button"
      onClick={() => onSort(sortKey)}
      className="inline-flex items-center gap-2 text-left text-sm font-semibold text-text-secondary"
    >
      <span>{label}</span>
      {!active && <ArrowUpDown className="h-4 w-4 text-text-secondary" />}
      {active && direction === 'asc' && <ArrowUpDown className="h-4 w-4 text-rose rotate-180" />}
      {active && direction === 'desc' && <ArrowUpDown className="h-4 w-4 text-rose" />}
    </button>
  );
}

export default SortableHeader;
