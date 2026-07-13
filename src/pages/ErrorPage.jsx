import { useNavigate, useRouteError } from 'react-router-dom';

export default function ErrorPage() {
  const navigate = useNavigate();
  const error = useRouteError();

  if (import.meta.env.DEV) {
    console.error('[ErrorBoundary]', error);
  }

  return (
    <div className="min-h-screen bg-page px-6 py-12 flex items-center justify-center">
      <div className="w-full max-w-2xl rounded-3xl bg-white p-12 text-center shadow-xl">
        <p className="text-6xl font-playfair text-rose">:(</p>
        <h1 className="mt-4 text-3xl font-semibold text-text-primary">Algo salió mal</h1>
        <p className="mt-3 text-text-secondary">
          Ocurrió un error inesperado. Intenta recargar la página; si el problema sigue, avísale al equipo técnico.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <button
            onClick={() => window.location.reload()}
            className="rounded-full border border-border-input px-6 py-3 text-sm font-semibold text-text-primary transition hover:bg-slate-50"
          >
            Recargar página
          </button>
          <button
            onClick={() => navigate('/dashboard')}
            className="rounded-full bg-rose px-6 py-3 text-sm font-semibold text-white transition hover:bg-rose-hover"
          >
            Volver al inicio
          </button>
        </div>
      </div>
    </div>
  );
}
