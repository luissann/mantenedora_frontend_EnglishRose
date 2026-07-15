import { useMemo, useState } from 'react';
import { parseISO } from 'date-fns';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Toggle } from '../../components/ui/Toggle';
import { DatePicker } from '../../components/ui/DatePicker';
import { PageHeader } from '../../components/shared/PageHeader';
import { Spinner } from '../../components/ui/Spinner';
import { useAlumnoCompleto } from '../../hooks/useAlumnos';
import { useActualizarProgramacionMensaje } from '../../hooks/useProgramacionMensajes';
import { formatDate, formatTime, formatCLP } from '../../utils/formatters';
import { DIAS_DISPLAY } from '../../utils/constants';

function EditarProgramacionModal({ programacion, onClose }) {
  const actualizarMutation = useActualizarProgramacionMensaje();
  const [fechaEnvio, setFechaEnvio] = useState(programacion ? parseISO(programacion.fecha_envio) : new Date());
  const [horaEnvio, setHoraEnvio] = useState(programacion?.hora_envio?.slice(0, 5) || '09:00');
  const [mensajePersonalizado, setMensajePersonalizado] = useState(programacion?.mensaje_personalizado || '');
  const [activo, setActivo] = useState(!!programacion?.activo);

  if (!programacion) return null;

  const handleGuardar = async () => {
    try {
      await actualizarMutation.mutateAsync({
        id: programacion.id,
        fecha_envio: fechaEnvio instanceof Date ? fechaEnvio.toISOString().split('T')[0] : fechaEnvio,
        hora_envio: horaEnvio,
        mensaje_personalizado: mensajePersonalizado.trim() || null,
        activo,
      });
      onClose();
    } catch {}
  };

  return (
    <Modal isOpen={!!programacion} onClose={onClose} title="Editar Programación de WhatsApp" size="md">
      <div className="space-y-4">
        <DatePicker label="Fecha de Envío" value={fechaEnvio} onChange={setFechaEnvio} />
        <div>
          <label className="text-sm text-text-secondary">Hora de Envío</label>
          <input
            type="time"
            value={horaEnvio}
            onChange={(e) => setHoraEnvio(e.target.value)}
            className="mt-2 w-full rounded-2xl border border-border-input bg-white px-4 py-3 text-sm outline-none focus:border-rose focus:ring-2 focus:ring-rose/20"
          />
        </div>
        <div>
          <label className="text-sm text-text-secondary">Mensaje personalizado</label>
          <textarea
            value={mensajePersonalizado}
            onChange={(e) => setMensajePersonalizado(e.target.value)}
            rows={4}
            placeholder="Déjalo vacío para usar el mensaje automático agrupado por programa."
            className="mt-2 w-full rounded-2xl border border-border-input bg-white px-4 py-3 text-sm outline-none focus:border-rose focus:ring-2 focus:ring-rose/20"
          />
        </div>
        <Toggle label="Estado del Envío" trueLabel="Enviar" falseLabel="Pausado" value={activo} onChange={setActivo} />
        <div className="flex justify-end gap-3 pt-2">
          <Button variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button variant="primary" loading={actualizarMutation.isPending} onClick={handleGuardar}>Guardar Cambios</Button>
        </div>
      </div>
    </Modal>
  );
}

export default function AlumnoPerfilPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, isLoading } = useAlumnoCompleto(id);
  const [paginaProgramaciones, setPaginaProgramaciones] = useState(1);
  const [editandoProgramacion, setEditandoProgramacion] = useState(null);
  const actualizarMutation = useActualizarProgramacionMensaje();

  const alumno = data?.data || {};

  const programaciones = useMemo(() => {
    return [...(alumno.programaciones || [])].sort((a, b) => {
      const fechaA = a.fecha_envio ? parseISO(a.fecha_envio).getTime() : 0;
      const fechaB = b.fecha_envio ? parseISO(b.fecha_envio).getTime() : 0;
      return fechaB - fechaA;
    });
  }, [alumno.programaciones]);

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  const nombreCompleto = [
    alumno.nombre,
    alumno.segundo_nombre,
    alumno.apellido,
    alumno.segundo_apellido,
  ]
    .filter(Boolean)
    .join(' ');

  const ultimoPago = alumno.pagos?.[0];
  const hoy = new Date();
  const inicioHoy = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
  const porPagina = 5;
  const totalPaginas = Math.max(1, Math.ceil(programaciones.length / porPagina));
  const paginaActual = Math.min(paginaProgramaciones, totalPaginas);
  const programacionesPagina = programaciones.slice((paginaActual - 1) * porPagina, paginaActual * porPagina);
  const programas = alumno.programas || [];

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
              {alumno.alias && (
                <p className="text-sm text-text-secondary">Alias: {alumno.alias}</p>
              )}
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
                Programas
              </p>
              <p className="text-lg font-semibold text-text-primary">
                {programas.length ? `${programas.length} activo(s)` : 'Sin programas'}
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
            Programas
          </h3>

          <div className="space-y-4 text-sm">
            {programas.length ? (
              programas.map((ap) => (
                <div key={ap.id} className="rounded-2xl border border-border-input p-3">
                  <p className="font-semibold text-text-primary">{ap.programa?.nombre || 'Programa'}</p>
                  <p className="text-text-secondary">
                    Docente: {ap.profesor ? `${ap.profesor.nombre} ${ap.profesor.apellido}` : 'Sin asignar'}
                  </p>
                  <p className="text-text-secondary">
                    Frecuencia: {ap.frecuencia} clase(s)/semana · {formatCLP(ap.valor_clase_clp)} x clase
                  </p>
                  <div className="mt-2 space-y-1">
                    {(ap.horarios || []).length ? (
                      ap.horarios.map((h) => (
                        <p key={h.id} className="text-xs text-text-secondary">
                          {DIAS_DISPLAY[h.dia_semana] || h.dia_semana} {formatTime(h.hora_inicio)}
                          {h.detalle ? ` · ${h.detalle}` : ''}
                        </p>
                      ))
                    ) : (
                      <p className="text-xs text-text-secondary">Sin horarios cargados.</p>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-text-secondary">
                Este alumno no tiene programas asignados.
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
                const fechaProgramada = programacion.fecha_envio ? parseISO(programacion.fecha_envio) : null;
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
                      Hora: {programacion.hora_envio ? formatTime(programacion.hora_envio) : '-'}
                    </p>
                    {programacion.mensaje_personalizado && (
                      <p className="mt-1 line-clamp-2 text-xs text-text-secondary">
                        Mensaje personalizado: {programacion.mensaje_personalizado}
                      </p>
                    )}
                    <div className="mt-2 flex items-center justify-between gap-2">
                      <Toggle
                        trueLabel="Enviar"
                        falseLabel="Pausado"
                        value={!!programacion.activo}
                        onChange={(value) => actualizarMutation.mutate({ id: programacion.id, activo: value })}
                      />
                      <button
                        type="button"
                        onClick={() => setEditandoProgramacion(programacion)}
                        className="text-xs font-semibold text-rose hover:underline"
                      >
                        Editar
                      </button>
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
      </div>

      <EditarProgramacionModal
        key={editandoProgramacion?.id || 'sin-seleccion'}
        programacion={editandoProgramacion}
        onClose={() => setEditandoProgramacion(null)}
      />
    </div>
  );
}
