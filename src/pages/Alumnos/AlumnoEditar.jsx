import { useNavigate, useParams } from 'react-router-dom';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Users, GraduationCap } from 'lucide-react';

import { PageHeader } from '../../components/shared/PageHeader';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { DatePicker } from '../../components/ui/DatePicker';
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

  const activo = watch('activo');

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

        <Card watermark>
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-rose" />
              <h3 className="text-lg font-semibold">Información Personal</h3>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <Input label="Primer Nombre" {...register('nombre')} />
              <Input label="Segundo Nombre" {...register('segundo_nombre')} />
              <Input label="Primer Apellido" {...register('apellido')} />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Input label="Segundo Apellido" {...register('segundo_apellido')} />
              <Input label="Teléfono" {...register('telefono')} />
            </div>

            <Input label="Correo Eléctronico" {...register('email')} />
          </div>
        </Card>

        <Card watermark>
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-rose" />
              <h3 className="text-lg font-semibold">Información Académica</h3>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Select
                label="Plan"
                options={planes}
                value={watch('id_plan')}
                onChange={(value) => setValue('id_plan', value)}
                searchable
              />

              <div>
                <p className="mb-2 text-sm text-text-secondary">Activo</p>
                <label>
                  <input
                    type="radio"
                    checked={activo === true}
                    onChange={() => setValue('activo', true)}
                  />
                  Active
                </label>

                <label>
                  <input
                    type="radio"
                    checked={activo === false}
                    onChange={() => setValue('activo', false)}
                  />
                  Inactive
                </label>
              </div>
            </div>

            <DatePicker
              label="Fecha de Ingreso"
              value={watch('fecha_ingreso')}
              onChange={(date) => setValue('fecha_ingreso', date)}
            />

            <textarea
              {...register('observaciones')}
              className="w-full rounded-xl border p-3"
              rows={4}
            />
          </div>
        </Card>

        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate(`/alumnos/${id}`)}
          >
            Cancel
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