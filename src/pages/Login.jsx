import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { QRCodeSVG } from 'qrcode.react';
import { login as loginRequest } from '../api/auth';
import useAuthStore from '../store/authStore';
import { formatRUT } from '../utils/formatters';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { useWhatsappEstado } from '../hooks/useWhatsapp';
import logo from '../assets/logo-english-rose.jpg';
import mascota from '../assets/duena-mascota.jpg';

const schema = z.object({
  rut: z.string().min(8, 'El RUT es obligatorio'),
  password: z.string().min(
    6,
    'La contraseña debe tener al menos 6 caracteres'
  ),
});

function useStarfield(count) {
  return useMemo(
    () =>
      Array.from({ length: count }, () => ({
        top: `${Math.random() * 100}%`,
        left: `${Math.random() * 100}%`,
        size: Math.random() < 0.15 ? 4 : Math.random() < 0.5 ? 3 : 2,
        delay: `${(Math.random() * 3.5).toFixed(2)}s`,
        duration: `${(2.5 + Math.random() * 3).toFixed(2)}s`,
      })),
    [count]
  );
}

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [loggedIn, setLoggedIn]         = useState(false);
  const [showQRModal, setShowQRModal]   = useState(false);

  const loginStore      = useAuthStore((state) => state.login);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const navigate        = useNavigate();
  const stars = useStarfield(45);

  // Solo activo tras iniciar sesión para verificar estado de WhatsApp
  const { data: waData } = useWhatsappEstado(loggedIn);
  const waEstado         = waData?.data;

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // Cuando obtenemos el estado de WhatsApp tras login, decidir si mostrar modal
  useEffect(() => {
    if (!loggedIn || !waEstado) return;
    if (!waEstado.listo) {
      setShowQRModal(true);  // Mostrar modal de QR
    } else {
      navigate('/dashboard', { replace: true });
    }
  }, [loggedIn, waEstado, navigate]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { rut: '', password: '' },
  });

  const rutRegister   = register('rut');
  const passwordRegister = register('password');
  const rutValue      = watch('rut');

  const onSubmit = async (values) => {
    try {
      const response = await loginRequest(values.rut, values.password);
      loginStore(response.data.token, response.data.usuario);
      toast.success('Sesión iniciada correctamente');
      setLoggedIn(true);  // Activar polling de WhatsApp
    } catch (error) {
      toast.error(
        error.response?.data?.message || 'No se pudo iniciar sesión'
      );
    }
  };

  const continuarAlDashboard = () => {
    setShowQRModal(false);
    navigate('/dashboard', { replace: true });
  };

  return (
    <div className="relative flex h-screen w-screen items-center justify-center overflow-hidden bg-gradient-to-br from-rose-light via-page to-[#EDD5C8]">
      {/* Constelación en tonos de marca */}
      <div className="pointer-events-none absolute inset-0">
        {stars.map((star, i) => (
          <span
            key={i}
            className="absolute rounded-full bg-rose/50 motion-safe:animate-twinkle"
            style={{
              top: star.top,
              left: star.left,
              width: star.size,
              height: star.size,
              animationDelay: star.delay,
              animationDuration: star.duration,
            }}
          />
        ))}

        {/* Nebulosas suaves */}
        <div className="absolute -left-40 -top-40 h-96 w-96 rounded-full bg-rose/25 blur-3xl" />
        <div className="absolute -bottom-48 -right-40 h-[30rem] w-[30rem] rounded-full bg-[#EDD5C8]/70 blur-3xl" />

        {/* Estrellas fugaces */}
        <span
          className="absolute left-[85%] top-[12%] h-px w-24 -rotate-[25deg] bg-gradient-to-r from-rose/70 via-rose/30 to-transparent motion-safe:animate-shooting"
          style={{ animationDelay: '0.5s' }}
        />
        <span
          className="absolute left-[70%] top-[55%] h-px w-16 -rotate-[25deg] bg-gradient-to-r from-rose/70 via-rose/30 to-transparent motion-safe:animate-shooting"
          style={{ animationDelay: '3.2s' }}
        />
      </div>

      <div className="relative z-10 h-full w-full overflow-y-auto border border-rose/10 bg-white/85 shadow-[0_25px_80px_-25px_rgba(193,122,94,0.45)] backdrop-blur-xl motion-safe:animate-card-in grid grid-cols-1 md:grid-cols-2">
        {/* Panel izquierdo: mascota + logo */}
        <div className="relative flex flex-col items-center justify-center gap-6 border-b border-rose/10 bg-gradient-to-b from-rose-light to-[#EDD5C8] p-10 md:border-b-0 md:border-r">
          <img
            src={logo}
            alt="English Rose Academy"
            className="h-14 w-14 rounded-full object-cover ring-4 ring-white shadow-md"
          />

          <div className="relative flex h-60 w-60 items-center justify-center">
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/70 via-rose/10 to-transparent blur-2xl" />
            <div className="absolute inset-2 rounded-full border border-rose/30" />
            <div className="absolute inset-5 rounded-full border border-white/60" />
            <span className="absolute left-1/2 top-1/2 h-2.5 w-2.5 -ml-1 -mt-1 rounded-full bg-rose shadow-[0_0_10px_2px_rgba(193,122,94,0.6)] motion-safe:animate-orbit" />
            <img
              src={mascota}
              alt="Directora de English Rose Academy"
              className="relative h-52 w-52 object-contain motion-safe:animate-float"
              style={{
                maskImage: 'radial-gradient(circle, black 62%, transparent 78%)',
                WebkitMaskImage: 'radial-gradient(circle, black 62%, transparent 78%)',
              }}
            />
          </div>

          <div className="text-center">
            <p className="text-sm text-text-secondary">
              Panel de administración — English Rose Academy
            </p>
          </div>
        </div>

        {/* Panel derecho: formulario */}
        <div className="flex items-center justify-center p-10">
          <div className="w-full max-w-md">
            <div className="mb-8 text-center md:text-left">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-rose">
                Base de control
              </p>
              <h2 className="mt-2 text-3xl font-playfair text-text-primary">
                Bienvenida de nuevo
              </h2>
              <p className="mt-2 text-sm text-text-secondary">
                Ingresa para administrar tus alumnos y clases
              </p>
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
                autoComplete="current-password"
                {...passwordRegister}
                error={errors.password?.message}
                rightIcon={
                  <button
                    type="button"
                    className="text-xs text-text-secondary"
                    onClick={() => setShowPassword((prev) => !prev)}
                  >
                    {showPassword ? 'Ocultar' : 'Mostrar'}
                  </button>
                }
              />

              <div className="flex items-center justify-between text-sm text-text-secondary">
                <label className="inline-flex items-center gap-2">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-border-input text-rose focus:ring-rose"
                  />
                  Recordar sesión
                </label>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                loading={isSubmitting}
                className="w-full"
              >
                Iniciar Sesión
              </Button>
            </form>
          </div>
        </div>
      </div>

      {/* ── Modal QR de WhatsApp ───────────────────────────────── */}
      {showQRModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="relative mx-4 w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl text-center">
            {/* Indicador de estado */}
            {waEstado?.listo ? (
              <>
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                  <span className="text-3xl">✅</span>
                </div>
                <h3 className="text-xl font-semibold text-text-primary mb-2">
                  ¡WhatsApp Conectado!
                </h3>
                <p className="text-text-secondary mb-6">
                  La sesión de WhatsApp está activa y lista para enviar mensajes.
                </p>
                <Button variant="primary" className="w-full" onClick={continuarAlDashboard}>
                  Continuar al Panel
                </Button>
              </>
            ) : waEstado?.tieneQR ? (
              <>
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-rose-light">
                  <span className="text-3xl">📱</span>
                </div>
                <h3 className="text-xl font-semibold text-text-primary mb-2">
                  Conectar WhatsApp
                </h3>
                <p className="text-text-secondary mb-5 text-sm">
                  Escanea este código QR desde tu teléfono:<br />
                  <strong>WhatsApp → Menú → Dispositivos vinculados → Vincular dispositivo</strong>
                </p>

                {/* QR renderizado como imagen */}
                <div className="flex justify-center mb-5">
                  <div className="rounded-2xl border-2 border-rose/20 p-4 bg-white shadow-inner">
                    <QRCodeSVG
                      value={waEstado.qr}
                      size={220}
                      level="M"
                      includeMargin={false}
                    />
                  </div>
                </div>

                <p className="text-xs text-text-secondary mb-4">
                  El código se actualiza automáticamente. Si expira, se generará uno nuevo.
                </p>
                <Button variant="secondary" className="w-full" onClick={continuarAlDashboard}>
                  Continuar sin conectar (por ahora)
                </Button>
              </>
            ) : (
              <>
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-yellow-100">
                  <span className="text-3xl">⏳</span>
                </div>
                <h3 className="text-xl font-semibold text-text-primary mb-2">
                  Iniciando WhatsApp...
                </h3>
                <p className="text-text-secondary mb-6 text-sm">
                  Espera unos segundos mientras se inicializa el servicio de mensajería.
                </p>
                <div className="h-2 w-full rounded-full bg-rose-light overflow-hidden mb-6">
                  <div className="h-full w-1/2 rounded-full bg-rose animate-pulse" />
                </div>
                <Button variant="secondary" className="w-full" onClick={continuarAlDashboard}>
                  Continuar sin esperar
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
