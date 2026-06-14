import { useNavigate } from 'react-router-dom';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-page px-6 py-12 flex items-center justify-center">
      <div className="w-full max-w-2xl rounded-3xl bg-white p-12 text-center shadow-xl">
        <p className="text-8xl font-playfair text-rose">404</p>
        <h1 className="mt-4 text-3xl font-semibold text-text-primary">Página no encontrada</h1>
        <p className="mt-3 text-text-secondary">La página que buscas no existe o fue movida.</p>
        <button
          onClick={() => navigate('/dashboard')}
          className="mt-8 inline-flex rounded-full bg-rose px-6 py-3 text-sm font-semibold text-white transition hover:bg-rose-hover"
        >
          Volver al inicio
        </button>
      </div>
    </div>
  );
}
