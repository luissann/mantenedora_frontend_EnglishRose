import { PageHeader } from '../components/shared/PageHeader';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';

export default function NotificacionesPage() {
  const notifications = [
    {
      id: 1,
      title: 'Pago recibido',
      message: 'Se ha registrado un pago de $50.000 del alumno Juan Pérez',
      date: '2024-01-15',
      read: false,
    },
    {
      id: 2,
      title: 'Alumno inactivo',
      message: 'María González no ha asistido a clases en 7 días',
      date: '2024-01-14',
      read: true,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Notificaciones" />

      <div className="space-y-3">
        {notifications.map((notif) => (
          <Card key={notif.id} watermark>
            <div className="flex justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold">{notif.title}</h4>
                  <Badge status={notif.read ? 'PAGADO' : 'PENDIENTE'} />
                </div>
                <p className="text-sm text-text-secondary mt-1">{notif.message}</p>
                <p className="text-xs text-text-muted mt-2">{notif.date}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
