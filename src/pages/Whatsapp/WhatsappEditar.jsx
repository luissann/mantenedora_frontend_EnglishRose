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

const schema = z.object({
  id_alumno: z.string().min(1, 'Student required'),
  dia_envio: z.string().min(1, 'Day required'),
  hora_envio: z.string().min(1, 'Time required'),
  mensaje: z.string().min(1, 'Message required'),
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
      await updateMutation.mutateAsync({ id, ...values });
      navigate('/whatsapp');
    } catch {}
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Edit WhatsApp Message" />

      <div className="grid gap-6 md:grid-cols-2">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <Card watermark>
            <div className="space-y-4">
              <Select
                label="Student"
                options={alumnos}
                value={watch('id_alumno')}
                onChange={(value) => setValue('id_alumno', value)}
                searchable
                error={errors.id_alumno?.message}
              />
              <Select
                label="Day of Week"
                options={[
                  { value: 'LUNES', label: 'Monday' },
                  { value: 'MARTES', label: 'Tuesday' },
                  { value: 'MIERCOLES', label: 'Wednesday' },
                  { value: 'JUEVES', label: 'Thursday' },
                  { value: 'VIERNES', label: 'Friday' },
                  { value: 'SABADO', label: 'Saturday' },
                  { value: 'DOMINGO', label: 'Sunday' },
                ]}
                value={watch('dia_envio')}
                onChange={(value) => setValue('dia_envio', value)}
                error={errors.dia_envio?.message}
              />
              <Input label="Send Time" type="time" {...register('hora_envio')} error={errors.hora_envio?.message} />
              <div>
                <label className="text-sm text-text-secondary">Message</label>
                <textarea
                  {...register('mensaje')}
                  onChange={(e) => {
                    setPreview(e.target.value);
                    register('mensaje').onChange(e);
                  }}
                  className="mt-2 w-full rounded-2xl border border-border-input bg-white px-4 py-3 text-sm outline-none focus:border-rose focus:ring-2 focus:ring-rose/20"
                  rows={5}
                  placeholder="Write your message..."
                />
                {errors.mensaje && <p className="mt-1 text-xs text-red-600">{errors.mensaje.message}</p>}
              </div>
              <div>
                <p className="mb-2 text-sm text-text-secondary">Active</p>
                <label className="flex items-center gap-2">
                  <input type="checkbox" {...register('activo')} />
                  <span>Keep scheduled</span>
                </label>
              </div>
            </div>
          </Card>

          <div className="flex gap-3 justify-end">
            <Button type="button" variant="secondary" onClick={() => navigate('/whatsapp')}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={isSubmitting || updateMutation.isPending}>
              Save Changes
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
