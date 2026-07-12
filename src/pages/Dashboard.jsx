import { useNavigate } from 'react-router-dom';
import { Clock, CreditCard, Layers, MessageCircle, UserCheck, Users } from 'lucide-react';
import { PageHeader } from '../components/shared/PageHeader';
import { StatCard } from '../components/shared/StatCard';
import { Card } from '../components/ui/Card';
import { Spinner } from '../components/ui/Spinner';
import { EmptyState } from '../components/shared/EmptyState';
import { useDashboard } from '../hooks/useDashboard';
import { formatCLP, formatDate, formatTime } from '../utils/formatters';

export default function Dashboard() {
  const navigate = useNavigate();
  const { data, isLoading, error } = useDashboard();

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-3xl bg-red-50 p-6 text-center text-red-600">
        Error al cargar el dashboard
      </div>
    );
  }

  const dashboard = data?.data || {};
  const pagosPorVencer = dashboard.pagosPorVencer || [];
  const clasesHoy = dashboard.clasesHoy || [];

  return (
    <div className="space-y-6">
      <PageHeader title="Panel Principal" />
      <div className="grid gap-6 md:grid-cols-3">
        <StatCard icon={Users} label="Total Alumnos" value={dashboard.totalAlumnos || '0'} color="rose" />
        <StatCard icon={UserCheck} label="Alumnos Activos" value={dashboard.alumnosActivos || '0'} color="green" />
        <StatCard icon={Layers} label="Total Planes" value={dashboard.totalPlanes || '0'} color="rose" />
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        <StatCard icon={CreditCard} label="Pagos Pendientes" value={dashboard.pagos?.pendientes || '0'} color="yellow" />
        <StatCard icon={MessageCircle} label="Pagos Vencidos" value={dashboard.pagos?.vencidos || '0'} color="red" />
        <StatCard icon={MessageCircle} label="Mensajes Hoy" value={dashboard.mensajesHoy?.total || '0'} color="rose" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card watermark>
          <div className="mb-4 flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-rose" />
            <h3 className="font-semibold text-text-primary">Pagos por vencer esta semana</h3>
          </div>
          {pagosPorVencer.length === 0 ? (
            <EmptyState title="Sin pagos pendientes esta semana" />
          ) : (
            <div className="space-y-1">
              {pagosPorVencer.map((pago) => (
                <button
                  key={pago.id}
                  type="button"
                  onClick={() => navigate(`/pagos/${pago.id}/editar`)}
                  className="flex w-full items-center justify-between rounded-2xl px-3 py-2.5 text-left text-sm hover:bg-rose-light/50"
                >
                  <span className="truncate">{pago.alumno?.nombre} {pago.alumno?.apellido}</span>
                  <span className="ml-3 flex shrink-0 items-center gap-3 text-text-secondary">
                    {formatCLP(pago.monto)}
                    <span className="text-xs text-text-muted">{formatDate(pago.fecha_vencimiento)}</span>
                  </span>
                </button>
              ))}
            </div>
          )}
        </Card>

        <Card watermark>
          <div className="mb-4 flex items-center gap-2">
            <Clock className="h-5 w-5 text-rose" />
            <h3 className="font-semibold text-text-primary">Clases de hoy</h3>
          </div>
          {clasesHoy.length === 0 ? (
            <EmptyState title="No hay clases programadas para hoy" />
          ) : (
            <div className="space-y-1">
              {clasesHoy.map((horario) => (
                <button
                  key={horario.id}
                  type="button"
                  onClick={() => navigate(`/alumnos/${horario.alumno?.id}`)}
                  className="flex w-full items-center justify-between rounded-2xl px-3 py-2.5 text-left text-sm hover:bg-rose-light/50"
                >
                  <span className="truncate">{horario.alumno?.nombre} {horario.alumno?.apellido}</span>
                  <span className="ml-3 shrink-0 text-text-secondary">{formatTime(horario.hora_inicio)}</span>
                </button>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
