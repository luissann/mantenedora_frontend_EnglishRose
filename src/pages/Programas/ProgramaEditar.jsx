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
import { useActualizarPrograma, usePrograma } from '../../hooks/useProgramas';

const schema = z.object({
  nombre: z.string().min(1, 'Nombre del programa requerido'),
  descripcion: z.string().optional(),
  precio_clp: z.coerce.number().min(0, 'Precio CLP requerido'),
  precio_usd: z.coerce.number().min(0, 'Precio USD requerido'),
  clases_semana: z.coerce.number().min(0, 'Clases por semana requerido'),
  activo: z.coerce.boolean(),
});

export default function ProgramaEditarPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: programaData, isLoading } = usePrograma(id);
  const updateMutation = useActualizarPrograma();

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
    if (!programaData?.data) return;
    const programa = programaData.data;
    reset({
      nombre: programa.nombre || '',
      descripcion: programa.descripcion || '',
      precio_clp: Number(programa.precio_clp || 0),
      precio_usd: Number(programa.precio_usd || 0),
      clases_semana: Number(programa.clases_semana || 0),
      activo: Boolean(programa.activo),
    });
  }, [programaData, reset]);

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
      navigate('/programas');
    } catch {}
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Editar Programa" />

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
          <Button type="submit" variant="primary" loading={isSubmitting || updateMutation.isPending}>
            Guardar Cambios
          </Button>
        </div>
      </form>
    </div>
  );
}
