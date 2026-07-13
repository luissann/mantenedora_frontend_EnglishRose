import { useNavigate, useParams } from 'react-router-dom';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Users, GraduationCap } from 'lucide-react';

import { PageHeader } from '../../components/shared/PageHeader';
import { FormErrorSummary } from '../../components/shared/FormErrorSummary';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { DatePicker } from '../../components/ui/DatePicker';
import { Toggle } from '../../components/ui/Toggle';
import { Button } from '../../components/ui/Button';
import { Spinner } from '../../components/ui/Spinner';

import { useActualizarAlumno, useAlumno } from '../../hooks/useAlumnos';
import { usePlanes } from '../../hooks/usePlanes';

const schema = z.object({
  nombre: z.string().min(1),
  segundo_nombre: z.string().optional(),
  apellido: z.string().min(1),
  segundo_apellido: z.string().optional(),
  telefono: z.string().min(1),
  email: z.string().email(),
  id_plan: z.string().min(1),
  activo: z.boolean(),
  fecha_ingreso: z.date().or(z.string()),
  observaciones: z.string().optional(),
});

export default function AlumnoEditarPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: alumnoRes, isLoading } = useAlumno(id);
  const { data: planesData } = usePlanes();
  const updateMutation = useActualizarAlumno();

  const alumno = alumnoRes?.data; // 🔥 FIX CLAVE

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
    if (!alumno) return;

    reset({
      nombre: alumno.nombre ?? '',
      segundo_nombre: alumno.segundo_nombre ?? '',
      apellido: alumno.apellido ?? '',
      segundo_apellido: alumno.segundo_apellido ?? '',
      telefono: alumno.telefono ?? '',
      email: alumno.email ?? '',
      id_plan: alumno.id_plan ? String(alumno.id_plan) : '',
      activo: Boolean(alumno.activo),
      fecha_ingreso: alumno.fecha_ingreso
        ? new Date(alumno.fecha_ingreso)
        : '',
      observaciones: alumno.observaciones ?? '',
    });
  }, [alumno, reset]);

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  const planes = (planesData?.data || []).map((p) => ({
    value: String(p.id),
    label: p.nombre,
  }));

  const onSubmit = async (values) => {
    let fechaFormateada = values.fecha_ingreso;
    if (values.fecha_ingreso instanceof Date) {
      fechaFormateada = values.fecha_ingreso.toISOString().split('T')[0];
    } else if (typeof values.fecha_ingreso === 'string' && values.fecha_ingreso.includes('T')) {
      fechaFormateada = values.fecha_ingreso.split('T')[0];
    }

    await updateMutation.mutateAsync({
      id,
      ...values,
      id_plan: Number(values.id_plan),
      activo: !!values.activo,
      fecha_ingreso: fechaFormateada,
    });

    navigate(`/alumnos/${id}`);
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Editar Alumno" />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <FormErrorSummary errors={errors} />

        <Card watermark={false}>
          <div className="space-y-6">
            <div className="flex items-center gap-3 text-text-primary">
              <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-rose-light text-rose">
                <Users className="h-4 w-4" />
              </span>
              <h3 className="text-lg font-semibold">Información Personal</h3>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Input label="Primer Nombre" placeholder="Ej: María" {...register('nombre')} error={errors.nombre?.message} />
              <Input label="Segundo Nombre" placeholder="Opcional" {...register('segundo_nombre')} />
              <Input label="Primer Apellido" placeholder="Ej: González" {...register('apellido')} error={errors.apellido?.message} />
              <Input label="Segundo Apellido" placeholder="Opcional" {...register('segundo_apellido')} />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Input label="Teléfono" placeholder="+56 9 1234 5678" {...register('telefono')} error={errors.telefono?.message} />
              <Input label="Correo Electrónico" placeholder="correo@ejemplo.com" {...register('email')} error={errors.email?.message} />
            </div>
          </div>
        </Card>

        <Card watermark={false}>
          <div className="space-y-6">
            <div className="flex items-center gap-3 text-text-primary">
              <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-rose-light text-rose">
                <GraduationCap className="h-4 w-4" />
              </span>
              <h3 className="text-lg font-semibold">Información Académica</h3>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Select
                label="Plan"
                placeholder="Seleccionar plan..."
                options={planes}
                value={watch('id_plan')}
                onChange={(value) => setValue('id_plan', value)}
                searchable
                error={errors.id_plan?.message}
              />
              <Toggle label="Estado de Actividad" value={watch('activo')} onChange={(value) => setValue('activo', value)} />
            </div>

            <DatePicker
              label="Fecha de Ingreso"
              value={watch('fecha_ingreso')}
              onChange={(date) => setValue('fecha_ingreso', date)}
            />

            <div>
              <label className="text-sm text-text-secondary">Notas</label>
              <textarea
                {...register('observaciones')}
                className="mt-2 w-full rounded-2xl border border-border-input bg-white px-4 py-3 text-sm outline-none transition focus:border-rose focus:ring-2 focus:ring-rose/20"
                rows={4}
                placeholder="Agrega notas sobre el alumno..."
              />
            </div>
          </div>
        </Card>

        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate(`/alumnos/${id}`)}
          >
            Cancelar
          </Button>

          <Button
            type="submit"
            variant="primary"
            loading={isSubmitting || updateMutation.isPending}
          >
            Guardar Cambios
          </Button>
        </div>
      </form>
    </div>
  );
}