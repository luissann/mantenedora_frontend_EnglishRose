import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { PageHeader } from '../components/shared/PageHeader';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';

const schema = z.object({
  nombre_institucion: z.string().min(1, 'Nombre de institución requerido'),
  email_soporte: z.string().email('Correo válido requerido'),
  telefono_soporte: z.string().min(1, 'Teléfono de soporte requerido'),
});

export default function ConfiguracionPage() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      nombre_institucion: 'English Rose Academy',
      email_soporte: 'support@englishroseacademy.com',
      telefono_soporte: '+56 9 1234 5678',
    },
  });

  const onSubmit = async (values) => {
    console.log('Settings saved:', values);
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Configuración" />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card watermark>
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Institution Settings</h3>
            <Input label="Institution Name" {...register('nombre_institucion')} error={errors.nombre_institucion?.message} />
            <Input label="Support Email" type="email" {...register('email_soporte')} error={errors.email_soporte?.message} />
            <Input label="Support Phone" {...register('telefono_soporte')} error={errors.telefono_soporte?.message} />
          </div>
        </Card>

        <div className="flex gap-3 justify-end">
          <Button type="submit" variant="primary" loading={isSubmitting}>
            Guardar Configuración
          </Button>
        </div>
      </form>
    </div>
  );
}
