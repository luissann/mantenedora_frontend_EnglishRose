import { CreditCard, Layers, MessageCircle, UserCheck, Users } from 'lucide-react';
import { PageHeader } from '../components/shared/PageHeader';
import { StatCard } from '../components/shared/StatCard';
import { Spinner } from '../components/ui/Spinner';
import { useDashboard } from '../hooks/useDashboard';

export default function Dashboard() {
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
    </div>
  );
}
