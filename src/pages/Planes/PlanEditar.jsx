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
  precio: z.number().min(0, 'Precio requerido'),
  duracion_meses: z.number().min(1, 'Duración requerida'),
});

export default function PlanEditarPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: planData, isLoading } = usePlan(id);
  const updateMutation = useActualizarPlan();

  const {
    register,
    handleSubmit,
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

  const onSubmit = async (values) => {
    try {
      await updateMutation.mutateAsync({ id, ...values });
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
            <Input label="Precio" type="number" step="0.01" {...register('precio', { valueAsNumber: true })} error={errors.precio?.message} />
            <Input label="Duración (meses)" type="number" {...register('duracion_meses', { valueAsNumber: true })} error={errors.duracion_meses?.message} />
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
