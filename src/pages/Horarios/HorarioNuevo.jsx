import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { PageHeader } from '../../components/shared/PageHeader';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Button } from '../../components/ui/Button';
import { useCrearHorario } from '../../hooks/useHorarios';
import { useAlumnos } from '../../hooks/useAlumnos';

const schema = z.object({
  id_alumno: z.string().min(1, 'Student required'),
  dia_semana: z.string().min(1, 'Day required'),
  hora_inicio: z.string().min(1, 'Start time required'),
  hora_fin: z.string().min(1, 'End time required'),
});

export default function HorarioNuevoPage() {
  const navigate = useNavigate();
  const { data: alumnosData } = useAlumnos({ limit: 100 });
  const createMutation = useCrearHorario();

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
      dia_semana: 'LUNES',
      hora_inicio: '09:00',
      hora_fin: '10:00',
    },
  });

  const alumnos = (alumnosData?.data || []).map((a) => ({
    value: a.id,
    label: a.nombre_completo,
  }));

  const onSubmit = async (values) => {
    try {
      await createMutation.mutateAsync(values);
      navigate('/horarios');
    } catch {}
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Create Schedule" />

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
              value={watch('dia_semana')}
              onChange={(value) => setValue('dia_semana', value)}
              error={errors.dia_semana?.message}
            />
            <div className="grid gap-4 md:grid-cols-2">
              <Input label="Start Time" type="time" {...register('hora_inicio')} error={errors.hora_inicio?.message} />
              <Input label="End Time" type="time" {...register('hora_fin')} error={errors.hora_fin?.message} />
            </div>
          </div>
        </Card>

        <div className="flex gap-3 justify-end">
          <Button type="button" variant="secondary" onClick={() => navigate('/horarios')}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" loading={isSubmitting || createMutation.isPending}>
            Create Schedule
          </Button>
        </div>
      </form>
    </div>
  );
}
