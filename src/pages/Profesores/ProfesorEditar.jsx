import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { PageHeader } from '../../components/shared/PageHeader';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Spinner } from '../../components/ui/Spinner';
import { useActualizarProfesor, useProfesor } from '../../hooks/useProfesores';

const schema = z.object({
  nombre: z.string().min(1, 'El nombre es requerido'),
  apellido: z.string().min(1, 'El apellido es requerido'),
  titulo: z.string().optional(),
  tarifa_hora_clp: z.coerce.number().min(0, 'La tarifa por hora no puede ser negativa'),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  telefono: z.string().optional(),
  activo: z.boolean(),
});

export default function ProfesorEditarPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: profesorData, isLoading } = useProfesor(id);
  const updateMutation = useActualizarProfesor();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      nombre: '', apellido: '', titulo: '', tarifa_hora_clp: 0, email: '', telefono: '', activo: true,
    },
  });

  useEffect(() => {
    if (!profesorData?.data) return;
    const p = profesorData.data;
    reset({
      nombre: p.nombre || '',
      apellido: p.apellido || '',
      titulo: p.titulo || '',
      tarifa_hora_clp: Number(p.tarifa_hora_clp || 0),
      email: p.email || '',
      telefono: p.telefono || '',
      activo: Boolean(p.activo),
    });
  }, [profesorData, reset]);

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  const activo = watch('activo');

  const onSubmit = async (values) => {
    try {
      await updateMutation.mutateAsync({ id, ...values, activo: values.activo ? 1 : 0 });
      navigate('/profesores');
    } catch {}
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Editar Profesor" />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card watermark>
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Input label="Nombre" {...register('nombre')} error={errors.nombre?.message} />
              <Input label="Apellido" {...register('apellido')} error={errors.apellido?.message} />
            </div>
            <Input label="Título / especialidad" {...register('titulo')} error={errors.titulo?.message} />
            <Input label="Tarifa por hora (CLP)" type="number" step="0.01" {...register('tarifa_hora_clp', { valueAsNumber: true })} error={errors.tarifa_hora_clp?.message} />
            <div className="grid gap-4 md:grid-cols-2">
              <Input label="Correo Electrónico" type="email" {...register('email')} error={errors.email?.message} />
              <Input label="Teléfono" {...register('telefono')} error={errors.telefono?.message} />
            </div>
            <div>
              <p className="mb-2 text-sm text-text-secondary">Estado</p>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={activo} onChange={(e) => setValue('activo', e.target.checked)} />
                <span>Profesor activo</span>
              </label>
            </div>
          </div>
        </Card>

        <div className="flex gap-3 justify-end">
          <Button type="button" variant="secondary" onClick={() => navigate('/profesores')}>
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
