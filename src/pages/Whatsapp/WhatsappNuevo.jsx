import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { PageHeader } from '../../components/shared/PageHeader';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Button } from '../../components/ui/Button';
import { useCrearProgramacionMensaje } from '../../hooks/useProgramacionMensajes';
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

export default function WhatsappNuevoPage() {
  const navigate = useNavigate();
  const { data: alumnosData } = useAlumnos({ limit: 100 });
  const createMutation = useCrearProgramacionMensaje();

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
      fecha_envio: new Date(),
      hora_envio: '09:00',
      mensaje: DEFAULT_MESSAGE,
      activo: true,
    },
  });

  const alumnos = normalizeAlumnosResponse(alumnosData).map((a) => ({
    value: String(a.id),
    label: [a.nombre, a.segundo_nombre, a.apellido, a.segundo_apellido].filter(Boolean).join(' ') || a.email || `Alumno ${a.id}`,
  }));

  const onSubmit = async (values) => {
    try {
      const fechaEnvio = values.fecha_envio instanceof Date
        ? values.fecha_envio.toISOString().split('T')[0]
        : values.fecha_envio;
      const mensaje = values.mensaje?.trim() || DEFAULT_MESSAGE;
      await createMutation.mutateAsync({ ...values, mensaje, fecha_envio: fechaEnvio });
      navigate('/whatsapp');
    } catch {}
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Programar Mensaje WhatsApp" />

      <div className="max-w-3xl">
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
                value={watch('fecha_envio')}
                onChange={(date) => setValue('fecha_envio', date)}
                error={errors.fecha_envio?.message}
              />
              <Input label="Hora de Envío" type="time" {...register('hora_envio')} error={errors.hora_envio?.message} />
              <div>
                <p className="mb-2 text-sm text-text-secondary">Estado</p>
                <label className="flex items-center gap-2">
                  <input type="checkbox" {...register('activo')} />
                  <span>Programar inmediatamente</span>
                </label>
              </div>
            </div>
          </Card>

          <div className="flex gap-3 justify-end">
            <Button type="button" variant="secondary" onClick={() => navigate('/whatsapp')}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary" loading={isSubmitting || createMutation.isPending}>
              Programar Mensaje
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
