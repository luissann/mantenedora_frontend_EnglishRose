import { ChevronDown } from 'lucide-react';
import { DIAS_SEMANA, DIAS_DISPLAY } from '../../utils/constants';

/**
 * Selector directo de día de la semana (select nativo) — el mensaje/clase se
 * repite cada semana, así que no tiene sentido elegir una fecha puntual de
 * calendario para llegar al día.
 */
export function DiaSemanaCalendarPicker({ diaSemana, onChange, label, error, compact = false }) {
  const selectClassName = compact
    ? 'w-32 appearance-none rounded-xl border border-border-input bg-white px-2 py-1.5 pr-8 text-sm outline-none focus:border-rose'
    : 'w-full appearance-none rounded-2xl border border-border-input bg-white px-4 py-3 pr-12 text-sm text-text-primary outline-none focus:border-rose focus:ring-2 focus:ring-rose/20';
  const iconClassName = compact
    ? 'pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary'
    : 'pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-text-secondary';

  return (
    <div className={compact ? undefined : 'space-y-2'}>
      {label && <span className="text-sm text-text-secondary">{label}</span>}
      <div className="relative">
        <select
          value={diaSemana || ''}
          onChange={(event) => onChange(event.target.value)}
          className={selectClassName}
        >
          <option value="" disabled>Seleccionar día...</option>
          {DIAS_SEMANA.map((dia) => (
            <option key={dia} value={dia}>{DIAS_DISPLAY[dia] || dia}</option>
          ))}
        </select>
        <ChevronDown className={iconClassName} />
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}

export default DiaSemanaCalendarPicker;
