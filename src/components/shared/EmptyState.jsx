import { Inbox } from 'lucide-react';

export function EmptyState({ title = 'Sin resultados', subtitle, actionLabel, onAction }) {
  return (
    <div className="flex min-h-[220px] flex-col items-center justify-center gap-4 rounded-3xl border border-border bg-white p-10 text-center text-text-secondary">
      <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-rose-light text-rose">
        <Inbox className="h-8 w-8" />
      </div>
      <div>
        <h3 className="text-xl font-semibold text-text-primary">{title}</h3>
        {subtitle && <p className="mt-2 text-sm text-text-secondary">{subtitle}</p>}
      </div>
      {actionLabel && (
        <button
          type="button"
          onClick={onAction}
          className="rounded-full bg-rose px-5 py-3 text-sm font-semibold text-white transition hover:bg-rose-hover"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}

export default EmptyState;
