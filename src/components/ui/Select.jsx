import { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';

export function Select({
  options,
  value,
  onChange,
  placeholder = 'Seleccionar...',
  searchable = false,
  label,
  error,
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const ref = useRef(null);

  const selected = options.find((option) => option.value === value);
  const filtered = useMemo(() => {
    if (!searchable || !query) return options;
    return options.filter((option) => option.label.toLowerCase().includes(query.toLowerCase()));
  }, [options, query, searchable]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="space-y-2">
      {label && <span className="text-sm text-text-secondary">{label}</span>}
      <div ref={ref} className="relative">
        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          className="w-full rounded-2xl border border-border-input bg-white px-4 py-3 text-left text-sm text-text-primary transition focus:border-rose focus:ring-2 focus:ring-rose/20"
        >
          <span>{selected ? selected.label : placeholder}</span>
          <ChevronDown className="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-text-secondary" />
        </button>

        {open && (
          <div className="absolute z-20 mt-2 w-full overflow-hidden rounded-3xl border border-border bg-white shadow-lg">
            {searchable && (
              <div className="border-b border-border px-4 py-3">
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Buscar..."
                  className="w-full rounded-2xl border border-border-input bg-slate-50 px-3 py-2 text-sm text-text-primary outline-none"
                />
              </div>
            )}
            <div className="max-h-56 overflow-y-auto">
              {filtered.map((option) => (
                <button
                  type="button"
                  key={option.value}
                  onClick={() => {
                    onChange(option.value);
                    setOpen(false);
                    setQuery('');
                  }}
                  className="w-full px-4 py-3 text-left text-sm text-text-primary transition hover:bg-rose-light"
                >
                  {option.label}
                </button>
              ))}
              {filtered.length === 0 && <div className="px-4 py-3 text-sm text-text-secondary">No hay opciones.</div>}
            </div>
          </div>
        )}
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}

export default Select;
