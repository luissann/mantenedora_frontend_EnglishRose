import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { PageHeader } from '../../components/shared/PageHeader';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { useCrearPrograma } from '../../hooks/useProgramas';

const schema = z.object({
  nombre: z.string().min(1, 'Nombre del programa requerido'),
  descripcion: z.string().optional(),
  precio_clp: z.coerce.number().min(0, 'Precio CLP requerido'),
  precio_usd: z.coerce.number().min(0, 'Precio USD requerido'),
  clases_semana: z.coerce.number().min(1, 'Clases por semana requeridas'),
  activo: z.coerce.boolean(),
});

export default function ProgramaNuevoPage() {
  const navigate = useNavigate();
  const createMutation = useCrearPrograma();

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
      descripcion: '',
      precio_clp: 0,
      precio_usd: 0,
      clases_semana: 1,
      activo: true,
    },
  });

  const activo = watch('activo');

  const onSubmit = async (values) => {
    try {
      await createMutation.mutateAsync({
        ...values,
        precio_clp: Number(values.precio_clp),
        precio_usd: Number(values.precio_usd),
        clases_semana: Number(values.clases_semana),
        activo: values.activo ? 1 : 0,
      });
      navigate('/programas');
    } catch {}
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Crear Programa" />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card watermark>
          <div className="space-y-4">
            <Input label="Nombre del Programa" {...register('nombre')} error={errors.nombre?.message} />
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
                <span>Programa activo</span>
              </label>
            </div>
          </div>
        </Card>

        <div className="flex gap-3 justify-end">
          <Button type="button" variant="secondary" onClick={() => navigate('/programas')}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" loading={isSubmitting || createMutation.isPending}>
            Crear Programa
          </Button>
        </div>
      </form>
    </div>
  );
}
