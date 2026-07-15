import DatePickerLib from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Calendar } from 'lucide-react';
import { DIAS_DISPLAY, diaSemanaDesdeFecha, proximaFechaParaDia } from '../../utils/constants';

const DatePickerComponent = DatePickerLib.default || DatePickerLib;

/**
 * Selector de día de la semana mediante un calendario real: al hacer clic en
 * cualquier fecha se toma su día de la semana (la clase se repite semanalmente,
 * no se guarda una fecha puntual). El calendario se renderiza en un portal para
 * que no quede recortado dentro de contenedores con overflow (ej. tablas).
 */
export function DiaSemanaCalendarPicker({ diaSemana, onChange, label, error, compact = false }) {
  if (compact) {
    return (
      <div className="relative">
        <DatePickerComponent
          selected={proximaFechaParaDia(diaSemana)}
          onChange={(fecha) => onChange(diaSemanaDesdeFecha(fecha))}
          dateFormat="dd/MM/yyyy"
          portalId="dia-semana-calendar-portal"
          className="w-32 rounded-xl border border-border-input bg-white px-2 py-1.5 pr-8 text-sm outline-none focus:border-rose"
        />
        <Calendar className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" />
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {label && <span className="text-sm text-text-secondary">{label}</span>}
      <div className="relative">
        <DatePickerComponent
          selected={proximaFechaParaDia(diaSemana)}
          onChange={(fecha) => onChange(diaSemanaDesdeFecha(fecha))}
          dateFormat="dd/MM/yyyy"
          portalId="dia-semana-calendar-portal"
          className="w-full rounded-2xl border border-border-input bg-white px-4 py-3 pr-12 text-sm text-text-primary outline-none focus:border-rose focus:ring-2 focus:ring-rose/20"
        />
        <Calendar className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-text-secondary" />
      </div>
      {diaSemana && (
        <p className="text-xs font-medium text-text-secondary">Día seleccionado: {DIAS_DISPLAY[diaSemana] || diaSemana}</p>
      )}
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}

export default DiaSemanaCalendarPicker;
