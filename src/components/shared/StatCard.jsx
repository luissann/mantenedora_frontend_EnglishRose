export function StatCard({ icon: Icon, label, value, trend, color = 'rose' }) {
  const colorStyles = {
    rose: 'text-rose',
    green: 'text-green-600',
    yellow: 'text-yellow-600',
    red: 'text-red-600',
  };

  return (
    <div className="rounded-3xl bg-white p-6 shadow-sm border border-border relative overflow-hidden">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-text-secondary">{label}</p>
          <p className="mt-3 text-3xl font-semibold text-text-primary">{value}</p>
        </div>
        <div className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-light text-white ${colorStyles[color]}`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
      {trend && <p className="mt-4 text-sm text-green-700">{trend}</p>}
    </div>
  );
}

export default StatCard;
