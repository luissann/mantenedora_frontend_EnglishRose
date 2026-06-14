import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { PageHeader } from '../../components/shared/PageHeader';
import { Spinner } from '../../components/ui/Spinner';
import { useAlumnoCompleto } from '../../hooks/useAlumnos';
import { formatDate, formatCLP } from '../../utils/formatters';

export default function AlumnoPerfilPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, isLoading } = useAlumnoCompleto(id);

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  const alumno = data?.data || {};

  return (
    <div className="space-y-6">
      <PageHeader title="Student Profile" />

      <Card relative watermark>
        <div className="grid gap-6 md:grid-cols-3">
          <div>
            <div className="mb-4 h-48 w-48 rounded-2xl bg-slate-200" />
          </div>
          <div className="space-y-4">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-text-secondary">Nombre Completo</p>
              <p className="text-lg font-semibold text-text-primary">{alumno.nombre_completo}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-text-secondary">Teléfono</p>
              <p className="text-sm text-text-primary">{alumno.telefono}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-text-secondary">Correo Electrónico</p>
              <p className="text-sm text-text-primary">{alumno.email}</p>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-rose">Plan</p>
              <p className="text-lg font-semibold text-text-primary">{alumno.plan_nombre}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-text-secondary">Fecha de Inscripción</p>
              <p className="text-sm text-text-primary">{formatDate(alumno.fecha_ingreso)}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-text-secondary">Estado de Pago</p>
              <Badge status={alumno.estado_pago} />
            </div>
          </div>
        </div>
      </Card>

      <div className="grid gap-6 md:grid-cols-3">
        <Card watermark>
          <h3 className="mb-4 font-semibold text-text-primary">Horario de Clases</h3>
          <div className="space-y-2 text-sm">
            {alumno.horarios?.map((h) => (
              <p key={h.id} className="text-text-secondary">
                {h.dia_semana} {h.hora_inicio}
              </p>
            ))}
          </div>
        </Card>

        <Card watermark>
          <h3 className="mb-4 font-semibold text-text-primary">Historial de Pagos</h3>
          <div className="space-y-2 text-xs">
            {alumno.pagos?.map((p) => (
              <div key={p.id} className="flex justify-between">
                <span className="text-text-secondary">{formatDate(p.fecha_pago)}</span>
                <span className="font-semibold">{formatCLP(p.monto)}</span>
                <Badge status={p.estado} />
              </div>
            ))}
          </div>
        </Card>

        <Card watermark>
          <h3 className="mb-4 font-semibold text-text-primary">Programación de WhatsApp</h3>
          <div className="space-y-2 text-sm">
            <p><span className="text-text-secondary">Día:</span> {alumno.programacion?.dia_envio}</p>
            <p><span className="text-text-secondary">Hora:</span> {alumno.programacion?.hora_envio}</p>
            <Badge status={alumno.programacion?.activo ? 'Programado' : 'Inactivo'} />
          </div>
        </Card>
      </div>

      <div className="flex gap-3 justify-end">
        <Button variant="primary" onClick={() => navigate(`/alumnos/${id}/editar`)}>
          Editar Alumno
        </Button>
        <Button variant="secondary" onClick={() => navigate(`/pagos/nuevo?alumno=${id}`)}>
          Registrar Pago
        </Button>
        <Button variant="secondary">
          Enviar WhatsApp Ahora
        </Button>
      </div>
    </div>
  );
}
