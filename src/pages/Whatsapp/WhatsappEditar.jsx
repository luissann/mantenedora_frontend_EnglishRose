import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { PageHeader } from '../../components/shared/PageHeader';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Button } from '../../components/ui/Button';
import { Spinner } from '../../components/ui/Spinner';
import { WhatsappPreview } from '../../components/shared/WhatsappPreview';
import { useActualizarProgramacionMensaje, useProgramacionMensaje } from '../../hooks/useProgramacionMensajes';
import { useAlumnos } from '../../hooks/useAlumnos';
import { DatePicker } from '../../components/ui/DatePicker';

const schema = z.object({
  id_alumno: z.string().min(1, 'Alumno requerido'),
  fecha_envio: z.date().or(z.string()).refine(val => val !== '', 'Fecha requerida'),
  hora_envio: z.string().min(1, 'Hora requerida'),
  mensaje: z.string().min(1, 'Mensaje requerido'),
  activo: z.boolean(),
});

export default function WhatsappEditarPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: programacionData, isLoading } = useProgramacionMensaje(id);
  const { data: alumnosData } = useAlumnos({ limit: 100 });
  const updateMutation = useActualizarProgramacionMensaje();
  const [preview, setPreview] = useState('');

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
  });

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  const alumnos = (alumnosData?.data || []).map((a) => ({
    value: a.id,
    label: a.nombre_completo,
  }));

  const onSubmit = async (values) => {
    try {
      const fechaEnvio = values.fecha_envio instanceof Date
        ? values.fecha_envio.toISOString().split('T')[0]
        : values.fecha_envio;
      await updateMutation.mutateAsync({ id, ...values, fecha_envio: fechaEnvio });
      navigate('/whatsapp');
    } catch {}
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Editar Mensaje de WhatsApp" />

      <div className="grid gap-6 md:grid-cols-2">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <Card watermark>
            <div className="space-y-4">
              <Select
                label="Alumno"
                options={alumnos}
                value={watch('id_alumno')}
                onChange={(value) => setValue('id_alumno', value)}
                searchable
                error={errors.id_alumno?.message}
              />
              <DatePicker
                label="Fecha Exacta de Envío"
                value={watch('fecha_envio') || new Date()}
                onChange={(date) => setValue('fecha_envio', date)}
                error={errors.fecha_envio?.message}
              />
              <Input label="Hora de Envío" type="time" {...register('hora_envio')} error={errors.hora_envio?.message} />
              <div>
                <label className="text-sm text-text-secondary">Mensaje</label>
                <textarea
                  {...register('mensaje')}
                  onChange={(e) => {
                    setPreview(e.target.value);
                    register('mensaje').onChange(e);
                  }}
                  className="mt-2 w-full rounded-2xl border border-border-input bg-white px-4 py-3 text-sm outline-none focus:border-rose focus:ring-2 focus:ring-rose/20"
                  rows={5}
                  placeholder="Escribe tu mensaje..."
                />
                {errors.mensaje && <p className="mt-1 text-xs text-red-600">{errors.mensaje.message}</p>}
              </div>
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

        <div>
          <WhatsappPreview message={preview} />
        </div>
      </div>
    </div>
  );
}
