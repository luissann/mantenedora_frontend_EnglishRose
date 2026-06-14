import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { PageHeader } from '../../components/shared/PageHeader';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { useCrearPlan } from '../../hooks/usePlanes';

const schema = z.object({
  nombre: z.string().min(1, 'Plan name required'),
  descripcion: z.string().optional(),
  precio: z.number().min(0, 'Price required'),
  duracion_meses: z.number().min(1, 'Duration required'),
});

export default function PlanNuevoPage() {
  const navigate = useNavigate();
  const createMutation = useCrearPlan();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      nombre: '',
      descripcion: '',
      precio: 0,
      duracion_meses: 1,
    },
  });

  const onSubmit = async (values) => {
    try {
      await createMutation.mutateAsync(values);
      navigate('/planes');
    } catch {}
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Create Plan" />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card watermark>
          <div className="space-y-4">
            <Input label="Plan Name" {...register('nombre')} error={errors.nombre?.message} />
            <div>
              <label className="text-sm text-text-secondary">Description</label>
              <textarea
                {...register('descripcion')}
                className="mt-2 w-full rounded-2xl border border-border-input bg-white px-4 py-3 text-sm outline-none focus:border-rose focus:ring-2 focus:ring-rose/20"
                rows={3}
              />
            </div>
            <Input label="Price" type="number" step="0.01" {...register('precio', { valueAsNumber: true })} error={errors.precio?.message} />
            <Input label="Duration (months)" type="number" {...register('duracion_meses', { valueAsNumber: true })} error={errors.duracion_meses?.message} />
          </div>
        </Card>

        <div className="flex gap-3 justify-end">
          <Button type="button" variant="secondary" onClick={() => navigate('/planes')}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" loading={isSubmitting || createMutation.isPending}>
            Create Plan
          </Button>
        </div>
      </form>
    </div>
  );
}
