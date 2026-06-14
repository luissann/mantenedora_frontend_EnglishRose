import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { PageHeader } from '../../components/shared/PageHeader';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Button } from '../../components/ui/Button';
import { Spinner } from '../../components/ui/Spinner';
import { useActualizarUsuario, useUsuario } from '../../hooks/useUsuarios';

const schema = z.object({
  nombre: z.string().min(1, 'First name required'),
  apellido: z.string().min(1, 'Last name required'),
  email: z.string().email('Valid email required'),
  rut: z.string().min(1, 'RUT required'),
  rol: z.string().min(1, 'Role required'),
  clave: z.string().optional(),
  activo: z.boolean(),
});

export default function UsuarioEditarPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: usuarioData, isLoading } = useUsuario(id);
  const updateMutation = useActualizarUsuario();

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

  const activo = watch('activo');

  const onSubmit = async (values) => {
    try {
      await updateMutation.mutateAsync({
        id,
        ...values,
        activo: values.activo ? 1 : 0,
      });
      navigate(`/usuarios/${id}`);
    } catch {}
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Edit User" />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card watermark>
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Input label="First Name" {...register('nombre')} error={errors.nombre?.message} />
              <Input label="Last Name" {...register('apellido')} error={errors.apellido?.message} />
            </div>
            <Input label="Email" type="email" {...register('email')} error={errors.email?.message} />
            <Input label="RUT" {...register('rut')} error={errors.rut?.message} />
            <Input label="Password (leave blank to keep current)" type="password" {...register('clave')} error={errors.clave?.message} />
            <Select
              label="Role"
              options={[
                { value: 'Admin', label: 'Admin' },
                { value: 'Coordinator', label: 'Coordinator' },
                { value: 'Teacher', label: 'Teacher' },
                { value: 'Staff', label: 'Staff' },
              ]}
              value={watch('rol')}
              onChange={(value) => setValue('rol', value)}
              error={errors.rol?.message}
            />
            <div>
              <p className="mb-2 text-sm text-text-secondary">Active</p>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={activo} onChange={(e) => setValue('activo', e.target.checked)} />
                <span>User is active</span>
              </label>
            </div>
          </div>
        </Card>

        <div className="flex gap-3 justify-end">
          <Button type="button" variant="secondary" onClick={() => navigate(`/usuarios/${id}`)}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" loading={isSubmitting || updateMutation.isPending}>
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
}
