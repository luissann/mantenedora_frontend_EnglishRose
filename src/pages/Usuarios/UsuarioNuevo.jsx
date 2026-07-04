import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { PageHeader } from '../../components/shared/PageHeader';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Button } from '../../components/ui/Button';
import { useCrearUsuario } from '../../hooks/useUsuarios';

const schema = z.object({
  nombre: z.string().min(1, 'El primer nombre es requerido'),
  apellido: z.string().min(1, 'El apellido es requerido'),
  email: z.string().email('Correo válido requerido'),
  rut: z.string().min(1, 'RUT requerido'),
  rol: z.string().min(1, 'Rol requerido'),
  clave: z.string().min(6, 'Password must be at least 6 characters'),
  activo: z.boolean(),
});

export default function UsuarioNuevoPage() {
  const navigate = useNavigate();
  const createMutation = useCrearUsuario();

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
      apellido: '',
      email: '',
      rut: '',
      rol: 'Staff',
      clave: '',
      activo: true,
    },
  });

  const activo = watch('activo');

  const onSubmit = async (values) => {
    try {
      await createMutation.mutateAsync({
        ...values,
        activo: values.activo ? 1 : 0,
      });
      navigate('/usuarios');
    } catch {}
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Crear Usuario" />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card watermark>
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Input label="Primer Nombre" {...register('nombre')} error={errors.nombre?.message} />
              <Input label="Primer Apellido" {...register('apellido')} error={errors.apellido?.message} />
            </div>
            <Input label="Correo Eléctronico" type="email" {...register('email')} error={errors.email?.message} />
            <Input label="RUT" {...register('rut')} error={errors.rut?.message} />
            <Input label="Contraseña" type="password" {...register('clave')} error={errors.clave?.message} />
            <Select
              label="Rol"
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
              <p className="mb-2 text-sm text-text-secondary">Activo</p>
              <label className="flex items-center gap-2">
                <input type="checkbox" {...register('activo')} checked={activo} onChange={(e) => setValue('activo', e.target.checked)} />
                <span>Activate user</span>
              </label>
            </div>
          </div>
        </Card>

        <div className="flex gap-3 justify-end">
          <Button type="button" variant="secondary" onClick={() => navigate('/usuarios')}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" loading={isSubmitting || createMutation.isPending}>
            Create User
          </Button>
        </div>
      </form>
    </div>
  );
}
