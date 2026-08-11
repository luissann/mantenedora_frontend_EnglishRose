import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { PageHeader } from '../../components/shared/PageHeader';
import { FormErrorSummary } from '../../components/shared/FormErrorSummary';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { useCrearProfesor, useSubirFotoProfesor } from '../../hooks/useProfesores';

const schema = z.object({
  nombre: z.string().min(1, 'El nombre es requerido'),
  apellido: z.string().min(1, 'El apellido es requerido'),
  titulo: z.string().optional(),
  tarifa_hora_clp: z.coerce.number().min(0, 'La tarifa por hora no puede ser negativa'),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  telefono: z.string().optional(),
});

export default function ProfesorNuevoPage() {
  const navigate = useNavigate();
  const createMutation = useCrearProfesor();
  const subirFotoMutation = useSubirFotoProfesor();
  const [foto, setFoto] = useState(null);
  const [fotoPreview, setFotoPreview] = useState(null);

  const onFotoChange = (e) => {
    const archivo = e.target.files?.[0] || null;
    setFoto(archivo);
    setFotoPreview(archivo ? URL.createObjectURL(archivo) : null);
  };

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      nombre: '',
      apellido: '',
      titulo: '',
      tarifa_hora_clp: 0,
      email: '',
      telefono: '',
    },
  });

  const onSubmit = async (values) => {
    try {
      const { data: profesorCreado } = await createMutation.mutateAsync(values);
      if (foto && profesorCreado?.id) {
        await subirFotoMutation.mutateAsync({ id: profesorCreado.id, archivo: foto });
      }
      navigate('/profesores');
    } catch {}
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Crear Profesor" />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <FormErrorSummary errors={errors} />
        <Card watermark>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              {fotoPreview ? (
                <img src={fotoPreview} alt="Vista previa" className="h-16 w-16 rounded-full object-cover" />
              ) : (
                <span className="flex h-16 w-16 items-center justify-center rounded-full bg-rose-light text-sm font-semibold text-rose">
                  Foto
                </span>
              )}
              <div>
                <label className="text-sm text-text-secondary">Foto (opcional)</label>
                <input type="file" accept="image/png,image/jpeg,image/webp" onChange={onFotoChange} className="mt-1 block text-sm" />
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <Input label="Nombre" {...register('nombre')} error={errors.nombre?.message} />
              <Input label="Apellido" {...register('apellido')} error={errors.apellido?.message} />
            </div>
            <Input label="Título / especialidad" placeholder="Ej: Docente de inglés, Universidad Católica de Temuco" {...register('titulo')} error={errors.titulo?.message} />
            <Input label="Tarifa por hora (CLP)" type="number" step="0.01" {...register('tarifa_hora_clp', { valueAsNumber: true })} error={errors.tarifa_hora_clp?.message} />
            <div className="grid gap-4 md:grid-cols-2">
              <Input label="Correo Electrónico" type="email" {...register('email')} error={errors.email?.message} />
              <Input label="Teléfono" {...register('telefono')} error={errors.telefono?.message} />
            </div>
          </div>
        </Card>

        <div className="flex gap-3 justify-end">
          <Button type="button" variant="secondary" onClick={() => navigate('/profesores')}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" loading={isSubmitting || createMutation.isPending}>
            Crear Profesor
          </Button>
        </div>
      </form>
    </div>
  );
}
