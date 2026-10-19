import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, Users } from 'lucide-react';
import { PageHeader } from '../../components/shared/PageHeader';
import { EmptyState } from '../../components/shared/EmptyState';
import { FilterTabs } from '../../components/ui/FilterTabs';
import { Spinner } from '../../components/ui/Spinner';
import { Button } from '../../components/ui/Button';
import { useHorarios } from '../../hooks/useHorarios';
import { formatTime } from '../../utils/formatters';
import { DIA_ROTATIVO, DIAS_DISPLAY } from '../../utils/constants';

const DIAS = ['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO', 'DOMINGO', DIA_ROTATIVO];

// getDay(): 0 = domingo. La vista abre en el día de hoy.
const DIA_DE_HOY = ['DOMINGO', 'LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO'][new Date().getDay()];

const SIN_PROFESOR = 'sin-asignar';

// Un día completo, con una columna por profesor y sus clases ordenadas por hora.
export default function HorarioDiaPage() {
  const navigate = useNavigate();
  const [dia, setDia] = useState(DIA_DE_HOY);

  const { data, isLoading } = useHorarios({ dia_semana: dia, activo: 'true', limit: 100 });

  const horarios = data?.data || [];
  const total = data?.pagination?.total ?? horarios.length;
  const esRotativo = dia === DIA_ROTATIVO;

  const columnas = useMemo(() => {
    const porProfesor = new Map();
    horarios.forEach((h) => {
      const id = h.profesor ? String(h.profesor.id) : SIN_PROFESOR;
      if (!porProfesor.has(id)) {
        porProfesor.set(id, {
          id,
          nombre: h.profesor ? `${h.profesor.nombre} ${h.profesor.apellido}` : 'Sin asignar',
          clases: [],
        });
      }
      porProfesor.get(id).clases.push(h);
    });
    const orden = (a, b) => String(a.hora_inicio || '').localeCompare(String(b.hora_inicio || ''))
      || String(a.alumno?.nombre || '').localeCompare(String(b.alumno?.nombre || ''), 'es');
    const lista = [...porProfesor.values()];
    lista.forEach((c) => c.clases.sort(orden));
    // "Sin asignar" siempre al final; el resto alfabético.
    return lista.sort((a, b) => (a.id === SIN_PROFESOR) - (b.id === SIN_PROFESOR) || a.nombre.localeCompare(b.nombre, 'es'));
  }, [horarios]);

  const tabs = DIAS.map((d) => ({ value: d, label: DIAS_DISPLAY[d] || d }));

  return (
    <div className="space-y-6">
      <PageHeader title="Horarios por día" />

      <div className="flex flex-wrap items-center gap-3">
        <Button variant="secondary" onClick={() => navigate('/horarios')}>Ver listado</Button>
        <Button variant="secondary" onClick={() => navigate('/horarios/semana')}>Vista Semanal por profesor</Button>
      </div>

      <FilterTabs tabs={tabs} activeTab={dia} onChange={setDia} />

      {isLoading ? (
        <div className="flex h-80 items-center justify-center"><Spinner size="lg" /></div>
      ) : horarios.length === 0 ? (
        <EmptyState title={esRotativo ? 'No hay clases rotativas' : `No hay clases el ${DIAS_DISPLAY[dia] || dia}`} />
      ) : (
        <>
          <p className="flex items-center gap-2 text-sm text-text-secondary">
            <Users className="h-4 w-4" aria-hidden="true" />
            {total} {total === 1 ? 'clase' : 'clases'} · {columnas.length} {columnas.length === 1 ? 'profesor' : 'profesores'}
            {total > horarios.length && <span className="text-amber-700"> (se muestran las primeras {horarios.length})</span>}
          </p>

          <div className="flex items-start gap-4 overflow-x-auto pb-3">
            {columnas.map((col) => (
              <section key={col.id} className="w-64 shrink-0 rounded-3xl border border-border bg-white shadow-sm">
                <header className="flex items-center justify-between gap-2 rounded-t-3xl bg-rose-light/70 px-4 py-3">
                  <h3 className="truncate text-sm font-semibold text-text-primary" title={col.nombre}>{col.nombre}</h3>
                  <span className="rounded-full bg-white px-2 py-0.5 text-xs font-semibold text-rose">{col.clases.length}</span>
                </header>
                <ul className="space-y-2 p-3">
                  {col.clases.map((h) => (
                    <li key={h.id}>
                      <button
                        type="button"
                        onClick={() => navigate(`/horarios/${h.id}/editar`)}
                        className="block w-full rounded-2xl border border-rose/15 bg-page px-3 py-2.5 text-left transition hover:border-rose/40 hover:bg-rose-light/50"
                      >
                        {!esRotativo && (
                          <span className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-rose">
                            <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                            {formatTime(h.hora_inicio)}{h.hora_fin ? ` – ${formatTime(h.hora_fin)}` : ''}
                          </span>
                        )}
                        <span className="block text-sm font-medium text-text-primary">{h.alumno?.nombre || 'Estudiante'}</span>
                        {h.detalle && <span className="mt-0.5 block text-xs text-text-secondary">{h.detalle}</span>}
                      </button>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
