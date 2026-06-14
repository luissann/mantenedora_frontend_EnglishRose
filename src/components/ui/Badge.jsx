import { ESTADO_BADGE } from '../../utils/constants';

export function Badge({ status, className }) {
  const config = ESTADO_BADGE[status] || { label: status, className: 'bg-slate-100 text-slate-700' };
  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] ${config.className} ${className || ''}`}>
      {config.label}
    </span>
  );
}

export default Badge;
