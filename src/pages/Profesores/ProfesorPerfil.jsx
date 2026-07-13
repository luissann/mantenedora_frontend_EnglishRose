import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Spinner } from '../../components/ui/Spinner';
import { PageHeader } from '../../components/shared/PageHeader';
import { ConfirmDialog } from '../../components/shared/ConfirmDialog';
import { useProfesor, useEliminarProfesor } from '../../hooks/useProfesores';
import { useHorarios } from '../../hooks/useHorarios';
import { formatCLP, formatTime } from '../../utils/formatters';

const DIA_LABEL = {
  LUNES: 'Lunes',
  MARTES: 'Martes',
  MIERCOLES: 'Miércoles',
  JUEVES: 'Jueves',
  VIERNES: 'Viernes',
  SABADO: 'Sábado',
  DOMINGO: 'Domingo',
};

export default function ProfesorPerfilPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, isLoading } = useProfesor(id);
  const { data: horariosData, isLoading: isLoadingHorarios } = useHorarios({ id_profesor: id, limit: 100 });
  const [confirmarDesactivar, setConfirmarDesactivar] = useState(false);
  const eliminarMutation = useEliminarProfesor();

  const profesor = data?.data || {};
  const horarios = horariosData?.data || [];

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  const nombreCompleto = [profesor.nombre, profesor.apellido].filter(Boolean).join(' ');

  return (
    <div className="space-y-6">
      <PageHeader title="Perfil del Profesor" />

      <Card relative watermark>
        <div className="grid gap-6 md:grid-cols-3">
          <div>
            <div className="mb-4 h-48 w-48 rounded-2xl bg-slate-200" />
          </div>

          <div className="space-y-4">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-text-secondary">Nombre Completo</p>
              <p className="text-lg font-semibold text-text-primary">{nombreCompleto}</p>
            </div>

            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-text-secondary">Teléfono</p>
              <p className="text-sm text-text-primary">{profesor.telefono || 'Sin registrar'}</p>
            </div>

            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-text-secondary">Correo Electrónico</p>
              <p className="text-sm text-text-primary">{profesor.email || 'Sin registrar'}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-rose">Título / Especialidad</p>
              <p className="text-lg font-semibold text-text-primary">{profesor.titulo || 'Sin registrar'}</p>
            </div>

            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-text-secondary">Tarifa por Hora</p>
              <p className="text-sm text-text-primary">{formatCLP(profesor.tarifa_hora_clp)}</p>
            </div>

            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-text-secondary">Estado</p>
              <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${profesor.activo ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'}`}>
                {profesor.activo ? 'Activo' : 'Inactivo'}
              </span>
            </div>
          </div>
        </div>
      </Card>

      <Card watermark>
        <h3 className="mb-4 font-semibold text-text-primary">Horario de Clases</h3>

        {isLoadingHorarios ? (
          <div className="flex h-24 items-center justify-center">
            <Spinner size="md" />
          </div>
        ) : (
          <div className="space-y-2 text-sm">
            {horarios.length ? (
              horarios.map((h) => (
                <div key={h.id} className="flex items-center justify-between gap-2 rounded-2xl border border-border-input px-3 py-2.5">
                  <span className="text-text-primary">
                    {[h.alumno?.nombre, h.alumno?.apellido].filter(Boolean).join(' ') || 'Alumno'}
                  </span>
                  <span className="text-text-secondary">
                    {DIA_LABEL[h.dia_semana] || h.dia_semana} {formatTime(h.hora_inicio)} - {formatTime(h.hora_fin)}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-text-secondary">No hay horarios registrados.</p>
            )}
          </div>
        )}
      </Card>

      <div className="flex justify-end gap-3">
        <Button variant="primary" onClick={() => navigate(`/profesores/${id}/editar`)}>
          Editar Profesor
        </Button>

        <Button variant="secondary" onClick={() => setConfirmarDesactivar(true)}>
          Desactivar Profesor
        </Button>
      </div>

      <ConfirmDialog
        isOpen={confirmarDesactivar}
        title="Desactivar Profesor"
        message="¿Estás seguro de que deseas desactivar este profesor?"
        onConfirm={() => {
          eliminarMutation.mutate(id);
          setConfirmarDesactivar(false);
        }}
        onCancel={() => setConfirmarDesactivar(false)}
        loading={eliminarMutation.isPending}
      />
    </div>
  );
}
