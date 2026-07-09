import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { PageHeader } from '../components/shared/PageHeader';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Spinner } from '../components/ui/Spinner';
import useAuthStore from '../store/authStore';
import { useActualizarUsuario, useUsuario } from '../hooks/useUsuarios';

const schema = z.object({
  nombre: z.string().min(1, 'El primer nombre es requerido'),
  segundo_nombre: z.string().optional(),
  apellido: z.string().min(1, 'El apellido es requerido'),
  segundo_apellido: z.string().optional(),
  email: z.string().email('Correo válido requerido'),
  rut: z.string().min(1, 'El RUT es requerido'),
  password_hash: z.string().optional(),
  activo: z.boolean(),
});

export default function ConfiguracionPage() {
  const usuarioAuth = useAuthStore((state) => state.usuario);
  const updateAuthUsuario = useAuthStore((state) => state.updateUsuario);
  const { data: usuarioData, isLoading } = useUsuario(usuarioAuth?.id);
  const actualizarUsuario = useActualizarUsuario();

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
      segundo_nombre: '',
      apellido: '',
      segundo_apellido: '',
      email: '',
      rut: '',
      password_hash: '',
      activo: true,
    },
  });

  useEffect(() => {
    const usuario = usuarioData?.data || usuarioAuth || {};
    if (!usuario) return;

    reset({
      nombre: usuario.nombre || '',
      segundo_nombre: usuario.segundo_nombre || '',
      apellido: usuario.apellido || '',
      segundo_apellido: usuario.segundo_apellido || '',
      email: usuario.email || '',
      rut: usuario.rut || '',
      password_hash: '',
      activo: Boolean(usuario.activo),
    });
  }, [usuarioAuth, usuarioData, reset]);

  const activo = watch('activo');

  const onSubmit = async (values) => {
    const payload = {
      nombre: values.nombre,
      segundo_nombre: values.segundo_nombre || '',
      apellido: values.apellido,
      segundo_apellido: values.segundo_apellido || '',
      email: values.email,
      rut: values.rut,
      activo: values.activo ? 1 : 0,
    };

    if (values.password_hash && values.password_hash.trim()) {
      payload.password_hash = values.password_hash;
    }

    try {
      const response = await actualizarUsuario.mutateAsync({ id: usuarioAuth?.id, ...payload });
      const usuarioActualizado = response?.data || response;
      updateAuthUsuario(usuarioActualizado);
    } catch {}
  };

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Mi configuración" />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card watermark>
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Datos personales</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <Input label="Primer Nombre" {...register('nombre')} error={errors.nombre?.message} />
              <Input label="Primer Apellido" {...register('apellido')} error={errors.apellido?.message} />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <Input label="Segundo Nombre" {...register('segundo_nombre')} error={errors.segundo_nombre?.message} />
              <Input label="Segundo Apellido" {...register('segundo_apellido')} error={errors.segundo_apellido?.message} />
            </div>
            <Input label="Correo Electrónico" type="email" {...register('email')} error={errors.email?.message} />
            <Input label="RUT" {...register('rut')} error={errors.rut?.message} />
            <Input label="Nueva contraseña (opcional)" type="password" {...register('password_hash')} error={errors.password_hash?.message} />
            <div>
              <p className="mb-2 text-sm text-text-secondary">Estado</p>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={activo} onChange={(e) => setValue('activo', e.target.checked)} />
                <span>Usuario activo</span>
              </label>
            </div>
          </div>
        </Card>

        <div className="flex gap-3 justify-end">
          <Button type="submit" variant="primary" loading={isSubmitting || actualizarUsuario.isPending}>
            Guardar cambios
          </Button>
        </div>
      </form>
    </div>
  );
}
