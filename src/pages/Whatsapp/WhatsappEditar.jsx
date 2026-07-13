import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { PageHeader } from '../../components/shared/PageHeader';
import { FormErrorSummary } from '../../components/shared/FormErrorSummary';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Spinner } from '../../components/ui/Spinner';
import { useActualizarProgramacionMensaje, useProgramacionMensaje } from '../../hooks/useProgramacionMensajes';
import { useAlumnos } from '../../hooks/useAlumnos';
import { DatePicker } from '../../components/ui/DatePicker';

const DEFAULT_MESSAGE = 'Hola, este es un mensaje de WhatsApp programado.';

const schema = z.object({
  id_alumno: z.string().min(1, 'Alumno requerido'),
  fecha_envio: z.date().or(z.string()).refine(val => val !== '', 'Fecha requerida'),
  hora_envio: z.string().min(1, 'Hora requerida'),
  mensaje: z.string().optional(),
  activo: z.boolean(),
});

const normalizeAlumnosResponse = (response) => {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.alumnos)) return response.alumnos;
  if (Array.isArray(response?.items)) return response.items;
  return [];
};

export default function WhatsappEditarPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: programacionData, isLoading } = useProgramacionMensaje(id);
  const { data: alumnosData } = useAlumnos({ limit: 100 });
  const updateMutation = useActualizarProgramacionMensaje();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    const programacion = programacionData?.data || programacionData || {};
    if (!programacion || Object.keys(programacion).length === 0) return;

    reset({
      id_alumno: String(programacion.id_alumno || ''),
      fecha_envio: programacion.fecha_envio ? new Date(programacion.fecha_envio) : new Date(),
      hora_envio: programacion.hora_envio || '09:00',
      mensaje: programacion.mensaje || DEFAULT_MESSAGE,
      activo: Boolean(programacion.activo),
    });

  }, [programacionData, reset]);

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  const alumnoSeleccionado = normalizeAlumnosResponse(alumnosData).find((a) => String(a.id) === String(watch('id_alumno')));
  const nombreAlumnoSeleccionado = [alumnoSeleccionado?.nombre, alumnoSeleccionado?.segundo_nombre, alumnoSeleccionado?.apellido, alumnoSeleccionado?.segundo_apellido]
    .filter(Boolean)
    .join(' ') || alumnoSeleccionado?.email || 'Sin alumno';

  const onSubmit = async (values) => {
    try {
      const fechaEnvio = values.fecha_envio instanceof Date
        ? values.fecha_envio.toISOString().split('T')[0]
        : values.fecha_envio;
      const mensaje = values.mensaje?.trim() || DEFAULT_MESSAGE;
      await updateMutation.mutateAsync({ id, ...values, mensaje, fecha_envio: fechaEnvio });
      navigate('/whatsapp');
    } catch {}
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Editar Mensaje de WhatsApp" />

      <div className="max-w-3xl">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <FormErrorSummary errors={errors} />
          <Card watermark>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm text-text-secondary">Alumno</label>
                <div className="rounded-2xl border border-border-input bg-slate-50 px-4 py-3 text-sm text-text-primary">
                  {nombreAlumnoSeleccionado}
                </div>
              </div>
              <DatePicker
                label="Fecha Exacta de Envío"
                value={watch('fecha_envio') || new Date()}
                onChange={(date) => setValue('fecha_envio', date)}
                error={errors.fecha_envio?.message}
              />
              <Input label="Hora de Envío" type="time" {...register('hora_envio')} error={errors.hora_envio?.message} />
              <div>
                <p className="mb-2 text-sm text-text-secondary">Estado</p>
                <label className="flex items-center gap-2">
                  <input type="checkbox" {...register('activo')} />
                  <span>Mantener programado</span>
                </label>
              </div>
            </div>
          </Card>

          <div className="flex gap-3 justify-end">
            <Button type="button" variant="secondary" onClick={() => navigate('/whatsapp')}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary" loading={isSubmitting || updateMutation.isPending}>
              Guardar Cambios
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
