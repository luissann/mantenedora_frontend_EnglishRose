import { useMemo, useState } from 'react';
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
  const [paginaProgramaciones, setPaginaProgramaciones] = useState(1);

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  const alumno = data?.data || {};

  const nombreCompleto = [
    alumno.nombre,
    alumno.segundo_nombre,
    alumno.apellido,
    alumno.segundo_apellido,
  ]
    .filter(Boolean)
    .join(' ');

  const ultimoPago = alumno.pagos?.[0];
  const programaciones = useMemo(() => {
    return [...(alumno.programaciones || [])].sort((a, b) => {
      const fechaA = a.fecha_envio ? new Date(a.fecha_envio).getTime() : 0;
      const fechaB = b.fecha_envio ? new Date(b.fecha_envio).getTime() : 0;
      return fechaB - fechaA;
    });
  }, [alumno.programaciones]);
  const hoy = new Date();
  const inicioHoy = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
  const porPagina = 5;
  const totalPaginas = Math.max(1, Math.ceil(programaciones.length / porPagina));
  const paginaActual = Math.min(paginaProgramaciones, totalPaginas);
  const programacionesPagina = programaciones.slice((paginaActual - 1) * porPagina, paginaActual * porPagina);

  return (
    <div className="space-y-6">
      <PageHeader title="Perfil del Alumno" />

      <Card relative watermark>
        <div className="grid gap-6 md:grid-cols-3">
          <div>
            <div className="mb-4 h-48 w-48 rounded-2xl bg-slate-200" />
          </div>

          <div className="space-y-4">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-text-secondary">
                Nombre Completo
              </p>
              <p className="text-lg font-semibold text-text-primary">
                {nombreCompleto}
              </p>
            </div>

            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-text-secondary">
                Teléfono
              </p>
              <p className="text-sm text-text-primary">
                {alumno.telefono}
              </p>
            </div>

            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-text-secondary">
                Correo Electrónico
              </p>
              <p className="text-sm text-text-primary">
                {alumno.email}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-rose">
                Plan
              </p>
              <p className="text-lg font-semibold text-text-primary">
                {alumno.plan?.nombre || 'Sin plan'}
              </p>
            </div>

            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-text-secondary">
                Fecha de Inscripción
              </p>
              <p className="text-sm text-text-primary">
                {formatDate(alumno.fecha_ingreso)}
              </p>
            </div>

            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-text-secondary">
                Estado de Pago
              </p>
              <Badge status={ultimoPago?.estado || 'Sin pagos'} />
            </div>
          </div>
        </div>
      </Card>

      <div className="grid gap-6 md:grid-cols-3">
        <Card watermark>
          <h3 className="mb-4 font-semibold text-text-primary">
            Horario de Clases
          </h3>

          <div className="space-y-2 text-sm">
            {alumno.horarios?.length ? (
              alumno.horarios.map((h) => (
                <p key={h.id} className="text-text-secondary">
                  {h.dia_semana} {h.hora_inicio}
                </p>
              ))
            ) : (
              <p className="text-text-secondary">
                No hay horarios registrados.
              </p>
            )}
          </div>
        </Card>

        <Card watermark>
          <h3 className="mb-4 font-semibold text-text-primary">
            Historial de Pagos
          </h3>

          <div className="space-y-2 text-xs">
            {alumno.pagos?.length ? (
              alumno.pagos.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between gap-2"
                >
                  <span className="text-text-secondary">
                    {formatDate(p.fecha_pago || p.fecha_vencimiento)}
                  </span>

                  <span className="font-semibold">
                    {formatCLP(p.monto)}
                  </span>

                  <Badge status={p.estado} />
                </div>
              ))
            ) : (
              <p className="text-text-secondary">
                No existen pagos registrados.
              </p>
            )}
          </div>
        </Card>

        <Card watermark>
          <h3 className="mb-4 font-semibold text-text-primary">
            Programación de WhatsApp
          </h3>

          <div className="space-y-3 text-sm">
            {programaciones.length ? (
              <>
                {programacionesPagina.map((programacion) => {
                const fechaProgramada = programacion.fecha_envio ? new Date(programacion.fecha_envio) : null;
                const yaPasada = fechaProgramada ? fechaProgramada < inicioHoy : false;

                return (
                  <div key={programacion.id} className="rounded-2xl border border-border-input p-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium text-text-primary">
                        {formatDate(programacion.fecha_envio)}
                      </span>
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                          yaPasada ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                        }`}
                      >
                        {yaPasada ? 'Vencida' : 'Pendiente'}
                      </span>
                    </div>
                    <p className="mt-2 text-text-secondary">
                      Hora: {programacion.hora_envio || '-'}
                    </p>
                    <div className="mt-2">
                      <Badge status={programacion.activo ? 'Programado' : 'Inactivo'} />
                    </div>
                  </div>
                );
                })}

                {totalPaginas > 1 && (
                  <div className="mt-3 flex items-center justify-between gap-2 border-t border-border-input pt-3 text-xs text-text-secondary">
                    <button
                      type="button"
                      onClick={() => setPaginaProgramaciones((p) => Math.max(1, p - 1))}
                      disabled={paginaActual === 1}
                      className="rounded-full border border-border-input px-2.5 py-1 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Anterior
                    </button>
                    <span>
                      Página {paginaActual} de {totalPaginas}
                    </span>
                    <button
                      type="button"
                      onClick={() => setPaginaProgramaciones((p) => Math.min(totalPaginas, p + 1))}
                      disabled={paginaActual === totalPaginas}
                      className="rounded-full border border-border-input px-2.5 py-1 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Siguiente
                    </button>
                  </div>
                )}
              </>
            ) : (
              <p className="text-text-secondary">
                No hay programación configurada.
              </p>
            )}
          </div>
        </Card>
      </div>

      <div className="flex justify-end gap-3">
        <Button
          variant="primary"
          onClick={() => navigate(`/alumnos/${id}/editar`)}
        >
          Editar Alumno
        </Button>

        <Button
          variant="secondary"
          onClick={() => navigate(`/pagos/nuevo?alumno=${id}`)}
        >
          Registrar Pago
        </Button>

        <Button variant="secondary">
          Enviar WhatsApp Ahora
        </Button>
      </div>
    </div>
  );
}