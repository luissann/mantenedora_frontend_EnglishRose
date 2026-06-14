import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { PageHeader } from '../../components/shared/PageHeader';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Button } from '../../components/ui/Button';
import { WhatsappPreview } from '../../components/shared/WhatsappPreview';
import { useCrearProgramacionMensaje } from '../../hooks/useProgramacionMensajes';
import { useAlumnos } from '../../hooks/useAlumnos';

const schema = z.object({
  id_alumno: z.string().min(1, 'Student required'),
  dia_envio: z.string().min(1, 'Day required'),
  hora_envio: z.string().min(1, 'Time required'),
  mensaje: z.string().min(1, 'Message required'),
  activo: z.boolean(),
});

export default function WhatsappNuevoPage() {
  const navigate = useNavigate();
  const { data: alumnosData } = useAlumnos({ limit: 100 });
  const createMutation = useCrearProgramacionMensaje();
  const [preview, setPreview] = useState('');

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      id_alumno: '',
      dia_envio: 'LUNES',
      hora_envio: '09:00',
      mensaje: '',
      activo: true,
    },
  });

  const alumnos = (alumnosData?.data || []).map((a) => ({
    value: a.id,
    label: a.nombre_completo,
  }));

  const onSubmit = async (values) => {
    try {
      await createMutation.mutateAsync(values);
      navigate('/whatsapp');
    } catch {}
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Schedule WhatsApp Message" />

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
                  <span>Schedule immediately</span>
                </label>
              </div>
            </div>
          </Card>

          <div className="flex gap-3 justify-end">
            <Button type="button" variant="secondary" onClick={() => navigate('/whatsapp')}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={isSubmitting || createMutation.isPending}>
              Schedule Message
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
