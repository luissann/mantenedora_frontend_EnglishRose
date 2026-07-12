import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, GraduationCap } from 'lucide-react';
import { useBuscarGlobal } from '../../hooks/useBuscar';

export function GlobalSearch() {
  const navigate = useNavigate();
  const containerRef = useRef(null);
  const [query, setQuery] = useState('');
  const [debounced, setDebounced] = useState('');
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => setDebounced(query), 300);
    return () => clearTimeout(timeout);
  }, [query]);

  const { data, isFetching } = useBuscarGlobal(debounced);
  const alumnos = data?.data?.alumnos || [];
  const hayResultados = alumnos.length > 0;
  const mostrarDropdown = open && debounced.trim().length >= 2;

  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const irA = (path) => {
    setOpen(false);
    setQuery('');
    navigate(path);
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <label className="relative block w-full">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-text-secondary" />
        <input
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          placeholder="Buscar alumno..."
          className="w-full rounded-2xl border border-border-input bg-white py-3 pl-12 pr-4 text-sm text-text-primary outline-none transition focus:border-rose focus:ring-2 focus:ring-rose/20"
        />
      </label>

      {mostrarDropdown && (
        <div className="absolute left-0 right-0 top-full z-40 mt-2 max-h-96 overflow-y-auto rounded-2xl border border-border bg-white p-2 shadow-xl">
          {isFetching ? (
            <p className="px-3 py-4 text-sm text-text-secondary">Buscando...</p>
          ) : !hayResultados ? (
            <p className="px-3 py-4 text-sm text-text-secondary">Sin resultados para &quot;{debounced}&quot;</p>
          ) : (
            <>
              {alumnos.length > 0 && (
                <div className="mb-1">
                  <p className="px-3 py-1 text-xs font-semibold uppercase tracking-wide text-text-muted">Alumnos</p>
                  {alumnos.map((a) => (
                    <button
                      key={`alumno-${a.id}`}
                      type="button"
                      onClick={() => irA(`/alumnos/${a.id}`)}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm hover:bg-rose-light/60"
                    >
                      <GraduationCap className="h-4 w-4 shrink-0 text-rose" />
                      <span className="flex-1 truncate">{a.nombre} {a.apellido}</span>
                      {a.telefono && <span className="shrink-0 text-xs text-text-muted">{a.telefono}</span>}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default GlobalSearch;
