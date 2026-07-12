import { useState } from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';
import { PageHeader } from '../components/shared/PageHeader';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Select } from '../components/ui/Select';
import { Spinner } from '../components/ui/Spinner';
import { Pagination } from '../components/ui/Pagination';
import { EmptyState } from '../components/shared/EmptyState';
import { useNotificaciones } from '../hooks/useProgramacionMensajes';
import { formatDateTime } from '../utils/formatters';

export default function NotificacionesPage() {
  const [estadoFilter, setEstadoFilter] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const { data, isLoading } = useNotificaciones({ estado_envio: estadoFilter, page, limit });
  const notificaciones = data?.data || [];
  const pagination = data?.pagination || {};

  return (
    <div className="space-y-6">
      <PageHeader title="Notificaciones" />

      <div className="grid gap-4 md:grid-cols-4">
        <Select
          options={[
            { value: 'ENVIADO', label: 'Enviados' },
            { value: 'FALLIDO', label: 'Fallidos' },
          ]}
          value={estadoFilter}
          onChange={(value) => { setEstadoFilter(value); setPage(1); }}
          placeholder="Todos los mensajes"
        />
      </div>

      {isLoading ? (
        <div className="flex h-80 items-center justify-center">
          <Spinner size="lg" />
        </div>
      ) : notificaciones.length === 0 ? (
        <EmptyState title="No hay mensajes de WhatsApp enviados todavía" />
      ) : (
        <>
          <div className="space-y-3">
            {notificaciones.map((notif) => {
              const exito = notif.estado_envio === 'ENVIADO';
              const nombreAlumno = [notif.alumno?.nombre, notif.alumno?.apellido].filter(Boolean).join(' ') || 'Alumno';

              return (
                <Card key={notif.id} watermark>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      {exito ? (
                        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />
                      ) : (
                        <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
                      )}
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="font-semibold text-text-primary">
                            {exito ? 'Mensaje enviado' : 'Mensaje no enviado'} a {nombreAlumno}
                          </h4>
                          <Badge status={exito ? 'Enviado' : 'Fallido'} />
                        </div>
                        <p className="mt-1 text-sm text-text-secondary">
                          {exito
                            ? 'Confirmación de clases entregada por WhatsApp.'
                            : notif.detalle_envio || 'No se pudo entregar el mensaje.'}
                        </p>
                        <p className="mt-2 text-xs text-text-muted">{formatDateTime(notif.enviado_en)}</p>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
          <Pagination pagination={pagination} onPageChange={setPage} onLimitChange={setLimit} />
        </>
      )}
    </div>
  );
}
