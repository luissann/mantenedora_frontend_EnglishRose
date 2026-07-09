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
import { useActualizarPlan, usePlan } from '../../hooks/usePlanes';

const schema = z.object({
  nombre: z.string().min(1, 'Nombre del plan requerido'),
  descripcion: z.string().optional(),
  precio_clp: z.coerce.number().min(0, 'Precio CLP requerido'),
  precio_usd: z.coerce.number().min(0, 'Precio USD requerido'),
  clases_semana: z.coerce.number().min(0, 'Clases por semana requerido'),
  activo: z.coerce.boolean(),
});

export default function PlanEditarPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: planData, isLoading } = usePlan(id);
  const updateMutation = useActualizarPlan();

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
      nombre: '',
      descripcion: '',
      precio_clp: 0,
      precio_usd: 0,
      clases_semana: 0,
      activo: true,
    },
  });

  useEffect(() => {
    if (!planData?.data) return;
    const plan = planData.data;
    reset({
      nombre: plan.nombre || '',
      descripcion: plan.descripcion || '',
      precio_clp: Number(plan.precio_clp || 0),
      precio_usd: Number(plan.precio_usd || 0),
      clases_semana: Number(plan.clases_semana || 0),
      activo: Boolean(plan.activo),
    });
  }, [planData, reset]);

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
      await updateMutation.mutateAsync({
        id,
        ...values,
        activo: values.activo ? 1 : 0,
      });
      navigate('/planes');
    } catch {}
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Editar Plan" />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card watermark>
          <div className="space-y-4">
            <Input label="Nombre del Plan" {...register('nombre')} error={errors.nombre?.message} />
            <div>
              <label className="text-sm text-text-secondary">Descripción</label>
              <textarea
                {...register('descripcion')}
                className="mt-2 w-full rounded-2xl border border-border-input bg-white px-4 py-3 text-sm outline-none focus:border-rose focus:ring-2 focus:ring-rose/20"
                rows={3}
              />
            </div>
            <Input label="Precio CLP" type="number" step="0.01" {...register('precio_clp', { valueAsNumber: true })} error={errors.precio_clp?.message} />
            <Input label="Precio USD" type="number" step="0.01" {...register('precio_usd', { valueAsNumber: true })} error={errors.precio_usd?.message} />
            <Input label="Clases por semana" type="number" {...register('clases_semana', { valueAsNumber: true })} error={errors.clases_semana?.message} />
            <div>
              <p className="mb-2 text-sm text-text-secondary">Estado</p>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={activo} onChange={(e) => setValue('activo', e.target.checked)} />
                <span>Plan activo</span>
              </label>
            </div>
          </div>
        </Card>

        <div className="flex gap-3 justify-end">
          <Button type="button" variant="secondary" onClick={() => navigate('/planes')}>
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
