import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { PageHeader } from '../../components/shared/PageHeader';
import { FormErrorSummary } from '../../components/shared/FormErrorSummary';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Button } from '../../components/ui/Button';
import { Spinner } from '../../components/ui/Spinner';
import { useActualizarHorario, useHorario } from '../../hooks/useHorarios';
import { useAlumnos } from '../../hooks/useAlumnos';
import { useProfesores } from '../../hooks/useProfesores';

const schema = z.object({
  id_alumno: z.string().min(1, 'Alumno requerido'),
  id_profesor: z.string().optional(),
  dia_semana: z.string().min(1, 'Día requerido'),
  hora_inicio: z.string().min(1, 'Hora de inicio requerida'),
  hora_fin: z.string().min(1, 'Hora de fin requerida'),
});

const normalizeAlumnosResponse = (response) => {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.alumnos)) return response.alumnos;
  if (Array.isArray(response?.items)) return response.items;
  return [];
};

export default function HorarioEditarPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: horarioData, isLoading } = useHorario(id);
  const { data: alumnosData } = useAlumnos({ limit: 100 });
  const { data: profesoresData } = useProfesores({ limit: 100, activo: 'true' });
  const updateMutation = useActualizarHorario();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      id_alumno: '',
      id_profesor: '',
      dia_semana: '',
      hora_inicio: '',
      hora_fin: '',
    },
  });

  useEffect(() => {
    if (!horarioData?.data) return;
    const horario = horarioData.data;
    reset({
      id_alumno:   String(horario.id_alumno || ''),
      id_profesor: horario.id_profesor ? String(horario.id_profesor) : '',
      dia_semana:  horario.dia_semana || '',
      hora_inicio: horario.hora_inicio ? horario.hora_inicio.slice(0, 5) : '',
      hora_fin:    horario.hora_fin ? horario.hora_fin.slice(0, 5) : '',
    });
  }, [horarioData, reset]);

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  const alumnos = normalizeAlumnosResponse(alumnosData).map((a) => ({
    value: String(a.id),
    label: [a.nombre, a.segundo_nombre, a.apellido, a.segundo_apellido].filter(Boolean).join(' ') || a.email || `Alumno ${a.id}`,
  }));

  const profesores = (profesoresData?.data || []).map((p) => ({
    value: String(p.id),
    label: `${p.nombre} ${p.apellido}`,
  }));

  const onSubmit = async (values) => {
    try {
      await updateMutation.mutateAsync({
        id,
        ...values,
        id_profesor: values.id_profesor || null,
      });
      navigate('/horarios');
    } catch {}
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Editar Horario" />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <FormErrorSummary errors={errors} />
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
              label="Profesor"
              options={profesores}
              value={watch('id_profesor')}
              onChange={(value) => setValue('id_profesor', value)}
              placeholder="Sin profesor asignado"
              searchable
              error={errors.id_profesor?.message}
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
