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
import { useActualizarHorario, useHorario } from '../../hooks/useHorarios';
import { useAlumnos } from '../../hooks/useAlumnos';

const schema = z.object({
  id_alumno: z.string().min(1, 'Alumno requerido'),
  dia_semana: z.string().min(1, 'Día requerido'),
  hora_inicio: z.string().min(1, 'Hora de inicio requerida'),
  hora_fin: z.string().min(1, 'Hora de fin requerida'),
});

export default function HorarioEditarPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: horarioData, isLoading } = useHorario(id);
  const { data: alumnosData } = useAlumnos({ limit: 100 });
  const updateMutation = useActualizarHorario();

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
    value: String(a.id),
    label: `${a.nombre} ${a.apellido}`,
  }));

  const onSubmit = async (values) => {
    try {
      await updateMutation.mutateAsync({ id, ...values });
      navigate('/horarios');
    } catch {}
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Editar Horario" />

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
            <Select
              label="Día de la Semana"
              options={[
                { value: 'LUNES', label: 'Lunes' },
                { value: 'MARTES', label: 'Martes' },
                { value: 'MIERCOLES', label: 'Miércoles' },
                { value: 'JUEVES', label: 'Jueves' },
                { value: 'VIERNES', label: 'Viernes' },
                { value: 'SABADO', label: 'Sábado' },
                { value: 'DOMINGO', label: 'Domingo' },
              ]}
              value={watch('dia_semana')}
              onChange={(value) => setValue('dia_semana', value)}
              error={errors.dia_semana?.message}
            />
            <div className="grid gap-4 md:grid-cols-2">
              <Input label="Hora de Inicio" type="time" {...register('hora_inicio')} error={errors.hora_inicio?.message} />
              <Input label="Hora de Fin" type="time" {...register('hora_fin')} error={errors.hora_fin?.message} />
            </div>
          </div>
        </Card>

        <div className="flex gap-3 justify-end">
          <Button type="button" variant="secondary" onClick={() => navigate('/horarios')}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" loading={isSubmitting || updateMutation.isPending}>
            Guardar Cambios
          </Button>
        </div>
      </form>
    </div>
  );
}
