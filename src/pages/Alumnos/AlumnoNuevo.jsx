import { useNavigate } from 'react-router-dom';
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
import { useCrearAlumno } from '../../hooks/useAlumnos';
import { usePlanes } from '../../hooks/usePlanes';

const schema = z.object({
  nombre: z.string().min(1, 'El primer nombre es requerido'),
  segundo_nombre: z.string().optional(),
  apellido: z.string().min(1, 'El apellido es requerido'),
  segundo_apellido: z.string().optional(),
  telefono: z.string().min(1, 'Teléfono requerido'),
  email: z.string().email('Correo válido requerido'),
  id_plan: z.string().min(1, 'Plan requerido'),
  activo: z.boolean(),
  fecha_ingreso: z.date().or(z.string()),
  observaciones: z.string().optional(),
});

export default function AlumnoNuevoPage() {
  const navigate = useNavigate();
  const { data: planesData } = usePlanes();
  const createMutation = useCrearAlumno();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      nombre: '',
      segundo_nombre: '',
      apellido: '',
      segundo_apellido: '',
      telefono: '',
      email: '',
      id_plan: '',
      activo: true,
      fecha_ingreso: new Date(),
      observaciones: '',
    },
  });

  const planes = (planesData?.data || []).map((p) => ({ value: String(p.id), label: p.nombre }));
  const activo = watch('activo');

  const onSubmit = async (values) => {
    try {
      let fechaFormateada = values.fecha_ingreso;
      if (values.fecha_ingreso instanceof Date) {
        fechaFormateada = values.fecha_ingreso.toISOString().split('T')[0];
      }

      await createMutation.mutateAsync({
        ...values,
        id_plan: Number(values.id_plan),
        activo: !!values.activo,
        fecha_ingreso: fechaFormateada,
      });
      navigate('/alumnos');
    } catch {}
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Crear Alumno" />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card watermark relative>
          <div className="space-y-6">
            <div className="flex items-center gap-2 text-text-primary">
              <Users className="h-5 w-5 text-rose" />
              <h3 className="text-lg font-semibold">Información Personal</h3>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <Input label="Primer Nombre" {...register('nombre')} error={errors.nombre?.message} />
              <Input label="Segundo Nombre" {...register('segundo_nombre')} />
              <Input label="Primer Apellido" {...register('apellido')} error={errors.apellido?.message} />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <Input label="Segundo Apellido" {...register('segundo_apellido')} />
              <Input label="Phone Number" {...register('telefono')} error={errors.telefono?.message} />
            </div>
            <Input label="Correo Eléctronico" type="email" {...register('email')} error={errors.email?.message} />
          </div>
        </Card>

        <Card watermark relative>
          <div className="space-y-6">
            <div className="flex items-center gap-2 text-text-primary">
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
                error={errors.id_plan?.message}
              />
              <div>
                <p className="mb-2 text-sm text-text-secondary">Estado de Actividad</p>
                <div className="space-y-2">
                  <label className="flex items-center gap-2">
                    <input type="radio" {...register('activo')} value="true" onChange={(e) => setValue('activo', e.target.value === 'true')} checked={activo === true} />
                    <span>Activo</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="radio" {...register('activo')} value="false" onChange={(e) => setValue('activo', e.target.value === 'true')} checked={activo === false} />
                    <span>Inactivo</span>
                  </label>
                </div>
              </div>
            </div>
            <DatePicker label="Fecha de Ingreso" value={watch('fecha_ingreso')} onChange={(date) => setValue('fecha_ingreso', date)} />
            <div>
              <label className="text-sm text-text-secondary">Notas</label>
              <textarea
                {...register('observaciones')}
                className="mt-2 w-full rounded-2xl border border-border-input bg-white px-4 py-3 text-sm outline-none focus:border-rose focus:ring-2 focus:ring-rose/20"
                rows={4}
                placeholder="Agrega notas sobre el alumno..."
              />
            </div>
          </div>
        </Card>

        <div className="flex gap-3 justify-end">
          <Button type="button" variant="secondary" onClick={() => navigate('/alumnos')}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" loading={isSubmitting || createMutation.isPending}>
            Guardar Alumno
          </Button>
        </div>
      </form>
    </div>
  );
}
