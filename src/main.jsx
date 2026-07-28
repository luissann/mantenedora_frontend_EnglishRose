import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider, keepPreviousData } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import App from './App';
import './index.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000, // evita refetch innecesario al remontar componentes con datos recientes
      // Un 429 (rate limit) es pasajero — vale la pena reintentar unas
      // veces más que un error normal en vez de rendirse y dejar la
      // pantalla vacía. Otros errores (404/validación) no se benefician de
      // reintentar, así que solo se estira el conteo para 429.
      retry: (failureCount, error) =>
        error?.response?.status === 429 ? failureCount < 4 : failureCount < 1,
      retryDelay: (failureCount, error) =>
        error?.response?.status === 429 ? 2000 * failureCount : 1000,
      // Mientras se reintenta, mantener los datos anteriores en pantalla en
      // vez de mostrarla vacía (evita el efecto "se borraron los alumnos"
      // ante un 429 momentáneo).
      placeholderData: keepPreviousData,
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <Toaster position="top-right" />
      <App />
    </QueryClientProvider>
  </React.StrictMode>
);