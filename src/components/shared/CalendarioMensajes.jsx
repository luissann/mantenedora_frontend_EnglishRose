import { useMemo, useState } from 'react';
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameMonth,
  isToday,
  addMonths,
  subMonths,
} from 'date-fns';
import { es } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react';
import { Card } from '../ui/Card';
import { Modal } from '../ui/Modal';
import { Spinner } from '../ui/Spinner';
import { EmptyState } from './EmptyState';
import { useCalendarioMensual } from '../../hooks/useProgramacionMensajes';

const ESTADO_DOT = {
  ENVIADO: 'bg-green-500',
  FALLIDO: 'bg-red-500',
  PENDIENTE: 'bg-blue-500',
};

const ESTADO_LABEL = {
  ENVIADO: 'Enviado',
  FALLIDO: 'Fallido',
  PENDIENTE: 'Pendiente',
};

export function CalendarioMensajes() {
  const [mesActual, setMesActual] = useState(() => new Date());
  const [diaSeleccionado, setDiaSeleccionado] = useState(null);

  const anio = mesActual.getFullYear();
  const mes = mesActual.getMonth() + 1;

  const { data, isLoading } = useCalendarioMensual(anio, mes);
  const registros = data?.data || [];

  const registrosPorDia = useMemo(() => {
    const mapa = {};
    for (const registro of registros) {
      const key = registro.fecha_envio;
      if (!mapa[key]) mapa[key] = [];
      mapa[key].push(registro);
    }
    return mapa;
  }, [registros]);

  const dias = useMemo(() => {
    const inicio = startOfWeek(startOfMonth(mesActual), { weekStartsOn: 1 });
    const fin = endOfWeek(endOfMonth(mesActual), { weekStartsOn: 1 });
    return eachDayOfInterval({ start: inicio, end: fin });
  }, [mesActual]);

  const registrosDelDiaSeleccionado = diaSeleccionado ? (registrosPorDia[diaSeleccionado] || []) : [];

  return (
    <Card watermark>
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CalendarDays className="h-5 w-5 text-rose" />
          <h3 className="font-semibold text-text-primary">Calendario de mensajes</h3>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setMesActual((m) => subMonths(m, 1))}
            className="rounded-full p-1.5 text-text-secondary hover:bg-rose-light/50"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="min-w-[9rem] text-center text-sm font-medium capitalize text-text-primary">
            {format(mesActual, 'MMMM yyyy', { locale: es })}
          </span>
          <button
            type="button"
            onClick={() => setMesActual((m) => addMonths(m, 1))}
            className="rounded-full p-1.5 text-text-secondary hover:bg-rose-light/50"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <Spinner size="lg" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold uppercase tracking-wide text-text-muted">
            {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map((d) => (
              <div key={d} className="py-1">{d}</div>
            ))}
          </div>
          <div className="mt-1 grid grid-cols-7 gap-1.5">
            {dias.map((dia) => {
              const key = format(dia, 'yyyy-MM-dd');
              const registrosDia = registrosPorDia[key] || [];
              const estadosPresentes = [...new Set(registrosDia.map((r) => r.estado_envio))];
              const enMes = isSameMonth(dia, mesActual);

              return (
                <button
                  key={key}
                  type="button"
                  disabled={registrosDia.length === 0}
                  onClick={() => setDiaSeleccionado(key)}
                  className={`flex h-24 flex-col items-center justify-start rounded-2xl border border-transparent p-2 text-base transition
                    ${enMes ? 'text-text-primary' : 'text-text-muted/50'}
                    ${isToday(dia) ? 'border-rose bg-rose-light/30' : ''}
                    ${registrosDia.length > 0 ? 'cursor-pointer hover:border-rose hover:bg-rose-light/40' : 'cursor-default'}`}
                >
                  <span className="font-medium">{format(dia, 'd')}</span>
                  <span className="mt-auto flex gap-1.5">
                    {estadosPresentes.map((estado) => (
                      <span key={estado} className={`h-2.5 w-2.5 rounded-full ${ESTADO_DOT[estado]}`} />
                    ))}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="mt-4 flex items-center gap-4 text-xs text-text-secondary">
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-green-500" /> Enviado</span>
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-red-500" /> Fallido</span>
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-blue-500" /> Pendiente</span>
          </div>
        </>
      )}

      <Modal
        isOpen={!!diaSeleccionado}
        onClose={() => setDiaSeleccionado(null)}
        title={diaSeleccionado ? format(new Date(`${diaSeleccionado}T00:00:00`), "d 'de' MMMM", { locale: es }) : ''}
        size="sm"
      >
        {registrosDelDiaSeleccionado.length === 0 ? (
          <EmptyState title="Sin mensajes programados ese día" />
        ) : (
          <div className="space-y-2">
            {registrosDelDiaSeleccionado.map((registro) => (
              <div
                key={registro.id}
                className="flex items-center justify-between rounded-2xl border border-border px-3 py-2 text-sm"
              >
                <span className="truncate">
                  {[registro.alumno?.nombre, registro.alumno?.apellido].filter(Boolean).join(' ') || 'Alumno'}
                </span>
                <span className="flex shrink-0 items-center gap-1.5 text-text-secondary">
                  <span className={`h-2 w-2 rounded-full ${ESTADO_DOT[registro.estado_envio]}`} />
                  {ESTADO_LABEL[registro.estado_envio]}
                </span>
              </div>
            ))}
          </div>
        )}
      </Modal>
    </Card>
  );
}

export default CalendarioMensajes;
