import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { PageHeader } from '../../components/shared/PageHeader';
import { FormErrorSummary } from '../../components/shared/FormErrorSummary';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Button } from '../../components/ui/Button';
import { Spinner } from '../../components/ui/Spinner';
import { useActualizarUsuario, useUsuario } from '../../hooks/useUsuarios';

const schema = z.object({
  nombre: z.string().min(1, 'El primer nombre es requerido'),
  segundo_nombre: z.string().optional(),
  apellido: z.string().min(1, 'El apellido es requerido'),
  segundo_apellido: z.string().optional(),
  email: z.string().email('Correo válido requerido'),
  telefono: z.string().optional(),
  rut: z.string().min(1, 'RUT requerido'),
  rol: z.string().min(1, 'Rol requerido'),
  password: z.string().optional().refine(
    (value) => !value || (value.length >= 8 && /[A-Z]/.test(value) && /[0-9]/.test(value)),
    'Debe tener 8+ caracteres, una mayúscula y un número'
  ),
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
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
  });

  React.useEffect(() => {
    if (!usuarioData?.data) return;
    const usuario = usuarioData.data;
    reset({
      nombre: usuario.nombre || '',
      segundo_nombre: usuario.segundo_nombre || '',
      apellido: usuario.apellido || '',
      segundo_apellido: usuario.segundo_apellido || '',
      email: usuario.email || '',
      telefono: usuario.telefono || '',
      rut: usuario.rut || '',
      rol: usuario.rol || 'Admin',
      password: '',
      activo: Boolean(usuario.activo),
    });
  }, [usuarioData, reset]);

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  const activo = watch('activo');

  const onSubmit = async (values) => {
    const { password, ...rest } = values;
    try {
      await updateMutation.mutateAsync({
        id,
        ...rest,
        ...(password ? { password } : {}),
        activo: values.activo ? 1 : 0,
      });
      navigate(`/usuarios/${id}`);
    } catch {}
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Editar Usuario" />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <FormErrorSummary errors={errors} />
        <Card watermark>
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Input label="Primer Nombre" {...register('nombre')} error={errors.nombre?.message} />
              <Input label="Primer Apellido" {...register('apellido')} error={errors.apellido?.message} />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <Input label="Segundo Nombre" {...register('segundo_nombre')} error={errors.segundo_nombre?.message} />
              <Input label="Segundo Apellido" {...register('segundo_apellido')} error={errors.segundo_apellido?.message} />
            </div>
            <Input label="Correo Eléctronico" type="email" {...register('email')} error={errors.email?.message} />
            <Input label="Teléfono" {...register('telefono')} error={errors.telefono?.message} />
            <Input label="RUT" {...register('rut')} error={errors.rut?.message} />
            <Input label="Contraseña (dejar en blanco para conservar la actual)" type="password" {...register('password')} error={errors.password?.message} />
            <Select
              label="Rol"
              options={[{ value: 'Admin', label: 'Administrador' }]}
              value={watch('rol')}
              onChange={(value) => setValue('rol', value)}
              error={errors.rol?.message}
            />
            <div>
              <p className="mb-2 text-sm text-text-secondary">Activo</p>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={activo} onChange={(e) => setValue('activo', e.target.checked)} />
                <span>Usuario activo</span>
              </label>
            </div>
          </div>
        </Card>

        <div className="flex gap-3 justify-end">
          <Button type="button" variant="secondary" onClick={() => navigate(`/usuarios/${id}`)}>
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
