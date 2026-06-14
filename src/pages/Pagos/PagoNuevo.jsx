import { useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { PageHeader } from '../../components/shared/PageHeader';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { DatePicker } from '../../components/ui/DatePicker';
import { Button } from '../../components/ui/Button';
import { useCrearPago } from '../../hooks/usePagos';
import { useAlumnos } from '../../hooks/useAlumnos';

const schema = z.object({
  id_alumno: z.string().min(1, 'Student required'),
  monto: z.number().min(0, 'Amount required'),
  fecha_pago: z.date().or(z.string()),
  metodo_pago: z.string().min(1, 'Payment method required'),
  estado: z.string().min(1, 'Status required'),
  referencia: z.string().optional(),
});

export default function PagoNuevoPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { data: alumnosData } = useAlumnos({ limit: 100 });
  const createMutation = useCrearPago();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      id_alumno: searchParams.get('alumno') || '',
      monto: 0,
      fecha_pago: new Date(),
      metodo_pago: 'TRANSFERENCIA',
      estado: 'PAGADO',
      referencia: '',
    },
  });

  const alumnos = (alumnosData?.data || []).map((a) => ({
    value: a.id,
    label: a.nombre_completo,
  }));

  const onSubmit = async (values) => {
    try {
      await createMutation.mutateAsync(values);
      navigate('/pagos');
    } catch {}
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Register Payment" />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card watermark>
          <div className="grid gap-4 md:grid-cols-2">
            <Select
              label="Student"
              options={alumnos}
              value={watch('id_alumno')}
              onChange={(value) => setValue('id_alumno', value)}
              searchable
              error={errors.id_alumno?.message}
            />
            <Input label="Amount" type="number" step="0.01" {...register('monto', { valueAsNumber: true })} error={errors.monto?.message} />
          </div>
        </Card>

        <Card watermark>
          <div className="grid gap-4 md:grid-cols-2">
            <DatePicker label="Payment Date" value={watch('fecha_pago')} onChange={(date) => setValue('fecha_pago', date)} />
            <Select
              label="Payment Method"
              options={[
                { value: 'TRANSFERENCIA', label: 'Bank Transfer' },
                { value: 'EFECTIVO', label: 'Cash' },
                { value: 'TARJETA', label: 'Credit Card' },
              ]}
              value={watch('metodo_pago')}
              onChange={(value) => setValue('metodo_pago', value)}
            />
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <Select
              label="Status"
              options={[
                { value: 'PAGADO', label: 'Paid' },
                { value: 'PENDIENTE', label: 'Pending' },
                { value: 'VENCIDO', label: 'Overdue' },
              ]}
              value={watch('estado')}
              onChange={(value) => setValue('estado', value)}
            />
            <Input label="Reference" {...register('referencia')} />
          </div>
        </Card>

        <div className="flex gap-3 justify-end">
          <Button type="button" variant="secondary" onClick={() => navigate('/pagos')}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" loading={isSubmitting || createMutation.isPending}>
            Register Payment
          </Button>
        </div>
      </form>
    </div>
  );
}
