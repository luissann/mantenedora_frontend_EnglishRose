import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { PageHeader } from '../../components/shared/PageHeader';
import { FormErrorSummary } from '../../components/shared/FormErrorSummary';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { DatePicker } from '../../components/ui/DatePicker';
import { Button } from '../../components/ui/Button';
import { Spinner } from '../../components/ui/Spinner';
import { useActualizarPago, usePago } from '../../hooks/usePagos';
import { useAlumnos } from '../../hooks/useAlumnos';

const schema = z.object({
  id_alumno: z.string().min(1, 'Alumno requerido'),
  monto: z.number().min(0, 'Monto requerido'),
  fecha_pago: z.date().or(z.string()),
  metodo_pago: z.string().min(1, 'Método de pago requerido'),
  estado: z.string().min(1, 'Estado requerido'),
  referencia: z.string().optional(),
});

const normalizeAlumnosResponse = (response) => {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.alumnos)) return response.alumnos;
  if (Array.isArray(response?.items)) return response.items;
  return [];
};

export default function PagoEditarPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: pagoData, isLoading } = usePago(id);
  const { data: alumnosData } = useAlumnos({ limit: 100 });
  const updateMutation = useActualizarPago();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
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

  const alumnos = normalizeAlumnosResponse(alumnosData).map((a) => ({
    value: String(a.id),
    label: [a.nombre, a.segundo_nombre, a.apellido, a.segundo_apellido].filter(Boolean).join(' ') || a.email || `Alumno ${a.id}`,
  }));

  const onSubmit = async (values) => {
    try {
      await updateMutation.mutateAsync({ id, ...values });
      navigate('/pagos');
    } catch {}
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Editar Pago" />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <FormErrorSummary errors={errors} />
        <Card watermark>
          <div className="grid gap-4 md:grid-cols-2">
            <Select
              label="Alumno"
              options={alumnos}
              value={watch('id_alumno')}
              onChange={(value) => setValue('id_alumno', value)}
              searchable
              error={errors.id_alumno?.message}
            />
            <Input label="Monto" type="number" step="0.01" {...register('monto', { valueAsNumber: true })} error={errors.monto?.message} />
          </div>
        </Card>

        <Card watermark>
          <div className="grid gap-4 md:grid-cols-2">
            <DatePicker label="Fecha de Pago" value={watch('fecha_pago')} onChange={(date) => setValue('fecha_pago', date)} />
            <Select
              label="Método de Pago"
              options={[
                { value: 'TRANSFERENCIA', label: 'Transferencia' },
                { value: 'EFECTIVO', label: 'Efectivo' },
                { value: 'TARJETA', label: 'Tarjeta' },
              ]}
              value={watch('metodo_pago')}
              onChange={(value) => setValue('metodo_pago', value)}
            />
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <Select
              label="Estado"
              options={[
                { value: 'PAGADO', label: 'Pagado' },
                { value: 'PENDIENTE', label: 'Pendiente' },
                { value: 'VENCIDO', label: 'Vencido' },
              ]}
              value={watch('estado')}
              onChange={(value) => setValue('estado', value)}
            />
            <Input label="Referencia" {...register('referencia')} />
          </div>
        </Card>

        <div className="flex gap-3 justify-end">
          <Button type="button" variant="secondary" onClick={() => navigate('/pagos')}>
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
