import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, XCircle, X } from 'lucide-react';
import { useNotificaciones } from '../../hooks/useProgramacionMensajes';
import useNotificacionesStore from '../../store/notificacionesStore';
import { formatDateTime } from '../../utils/formatters';
import { EmptyState } from './EmptyState';
import { Spinner } from '../ui/Spinner';

export function NotificacionesDropdown({ open, onClose }) {
  const navigate = useNavigate();
  const containerRef = useRef(null);
  const { data, isLoading } = useNotificaciones({ limit: 8 }, { enabled: open });
  const descartadas = useNotificacionesStore((state) => state.descartadas);
  const descartar = useNotificacionesStore((state) => state.descartar);
  const descartarTodas = useNotificacionesStore((state) => state.descartarTodas);
  const todasLasNotificaciones = data?.data || [];
  const notificaciones = todasLasNotificaciones.filter((notif) => !descartadas.includes(notif.id));

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        onClose();
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      ref={containerRef}
      className="absolute right-0 top-full z-40 mt-2 w-80 overflow-hidden rounded-2xl border border-border bg-white shadow-xl sm:w-96"
    >
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <h3 className="font-semibold text-text-primary">Notificaciones</h3>
        {notificaciones.length > 0 && (
          <button
            type="button"
            onClick={() => descartarTodas(todasLasNotificaciones.map((n) => n.id))}
            className="text-xs font-medium text-rose hover:underline"
          >
            Borrar todas
          </button>
        )}
      </div>

      <div className="max-h-96 overflow-y-auto">
        {isLoading ? (
          <div className="flex h-32 items-center justify-center">
            <Spinner size="md" />
          </div>
        ) : notificaciones.length === 0 ? (
          <div className="p-4">
            <EmptyState title="No hay notificaciones todavía" />
          </div>
        ) : (
          notificaciones.map((notif) => {
            const exito = notif.estado_envio === 'ENVIADO';
            const nombreAlumno = [notif.alumno?.nombre, notif.alumno?.apellido].filter(Boolean).join(' ') || 'Alumno';

            return (
              <div
                key={notif.id}
                className="group flex w-full items-start gap-3 border-b border-border px-4 py-3 text-left last:border-b-0 hover:bg-rose-light/40"
              >
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    if (notif.alumno?.id) navigate(`/alumnos/${notif.alumno.id}`);
                  }}
                  className="flex min-w-0 flex-1 items-start gap-3 text-left"
                >
                  {exito ? (
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />
                  ) : (
                    <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm text-text-primary">
                      <span className="font-semibold">{exito ? 'Mensaje enviado' : 'Mensaje no enviado'}</span> a {nombreAlumno}
                    </p>
                    <p className="mt-0.5 text-xs text-text-muted">{formatDateTime(notif.enviado_en)}</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    descartar(notif.id);
                  }}
                  className="shrink-0 rounded-full p-1 text-text-muted opacity-0 transition hover:bg-slate-200 hover:text-text-primary group-hover:opacity-100"
                  title="Quitar de la vista previa"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            );
          })
        )}
      </div>

      <button
        type="button"
        onClick={() => {
          onClose();
          navigate('/notificaciones');
        }}
        className="block w-full border-t border-border px-4 py-3 text-center text-sm font-medium text-rose hover:bg-rose-light/40"
      >
        Ver todas las notificaciones
      </button>
    </div>
  );
}

export default NotificacionesDropdown;
