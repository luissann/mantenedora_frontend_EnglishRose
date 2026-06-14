import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { login as loginRequest } from '../api/auth';
import useAuthStore from '../store/authStore';
import { formatRUT } from '../utils/formatters';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';

const schema = z.object({
  rut: z.string().min(8, 'El RUT es obligatorio'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const loginStore = useAuthStore((state) => state.login);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      rut: '',
      password: '',
    },
  });

  const rutRegister = register('rut');
  const passwordRegister = register('password');
  const rutValue = watch('rut');

  const onSubmit = async (values) => {
    try {
      const { data } = await loginRequest(values.rut, values.password);
     loginStore(data.token, data.usuario);
     navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'No se pudo iniciar sesión');
    }
  };

  console.log(localStorage.getItem('sofi-rose-auth'));

  return (
    <div className="min-h-screen flex items-center justify-center bg-page px-6 py-12">
      <div className="w-full max-w-6xl overflow-hidden rounded-3xl bg-white shadow-xl grid grid-cols-1 md:grid-cols-2">
        <div className="bg-gradient-to-b from-rose-light to-[#EDD5C8] p-10 flex flex-col justify-center">
          <h1 className="font-playfair text-4xl text-rose mb-6">Empowering students through English.</h1>
          <p className="text-text-secondary max-w-xl">Administra alumnos, planes y mensajes desde un panel moderno diseñado para Sofi Rose Academy.</p>
        </div>

        <div className="p-10 bg-white flex items-center justify-center">
          <div className="w-full max-w-md">
            <div className="mb-8 text-center">
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-rose-light text-rose text-2xl font-semibold">SR</div>
              <h2 className="mt-4 text-3xl font-playfair text-text-primary">Bienvenida de nuevo</h2>
              <p className="mt-2 text-text-secondary">Ingresa para administrar tus alumnos y clases</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <Input
                label="RUT"
                placeholder="12.345.678-9"
                value={rutValue}
                onChange={(event) => {
                  const formatted = formatRUT(event.target.value);
                  rutRegister.onChange(event);
                  setValue('rut', formatted);
                }}
                onBlur={rutRegister.onBlur}
                error={errors.rut?.message}
              />

              <Input
                label="Contraseña"
                type={showPassword ? 'text' : 'password'}
                placeholder="********"
                {...passwordRegister}
                error={errors.password?.message}
                rightIcon={
                  <button type="button" className="text-xs text-text-secondary" onClick={() => setShowPassword((prev) => !prev)}>
                    {showPassword ? 'Ocultar' : 'Mostrar'}
                  </button>
                }
              />

              <div className="flex items-center justify-between text-sm text-text-secondary">
                <label className="inline-flex items-center gap-2">
                  <input type="checkbox" className="h-4 w-4 rounded border-border-input text-rose focus:ring-rose" />
                  Recordar sesión
                </label>
                <button type="button" className="text-rose hover:text-rose-hover">
                  ¿Has olvidado tu contraseña?
                </button>
              </div>

              <Button type="submit" variant="primary" size="lg" loading={isSubmitting} className="w-full">
                Iniciar Sesión
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
