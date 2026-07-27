import { useEffect } from 'react';
import { WifiOff } from 'lucide-react';
import useSystemStatusStore from '../../store/systemStatusStore';
import { apiBaseURL } from '../../api/client';

const REINTENTO_MS = 15_000;

// El health check vive en la raíz del backend (no bajo /api), así que se
// arma la URL a partir del mismo host que usa el cliente de axios (ver
// client.js — misma detección de origen, un solo lugar de verdad).
const HEALTH_URL = `${apiBaseURL.replace(/\/api\/?$/, '')}/health`;

export function SistemaCaido() {
  const backendCaido = useSystemStatusStore((state) => state.backendCaido);
  const marcarRecuperado = useSystemStatusStore((state) => state.marcarRecuperado);

  useEffect(() => {
    if (!backendCaido) return;

    const intervalo = setInterval(async () => {
      try {
        const res = await fetch(HEALTH_URL);
        if (res.ok) marcarRecuperado();
      } catch {
        // sigue caído, se reintenta en el próximo ciclo
      }
    }, REINTENTO_MS);

    return () => clearInterval(intervalo);
  }, [backendCaido, marcarRecuperado]);

  if (!backendCaido) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-page px-6 py-12">
      <div className="w-full max-w-lg rounded-3xl bg-white p-12 text-center shadow-2xl">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-rose-light text-rose">
          <WifiOff className="h-8 w-8" />
        </div>
        <h1 className="mt-6 text-2xl font-semibold text-text-primary">Sistema caído</h1>
        <p className="mt-3 text-text-secondary">
          No logramos conectar con el servidor. Puede ser un corte momentáneo — estamos reintentando
          automáticamente. Si el problema sigue después de unos minutos, contacta al equipo de mantención.
        </p>
        <p className="mt-6 text-xs uppercase tracking-[0.15em] text-text-muted">
          Reintentando conexión...
        </p>
      </div>
    </div>
  );
}

export default SistemaCaido;
