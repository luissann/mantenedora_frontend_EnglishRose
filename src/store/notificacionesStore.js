import { create } from 'zustand';

const STORAGE_KEY = 'sofi-rose-notificaciones-vista';
const DESCARTADAS_KEY = 'sofi-rose-notificaciones-descartadas';

const loadInitialState = () => {
  let ultimaVista = null;
  let descartadas = [];
  try {
    ultimaVista = window.localStorage.getItem(STORAGE_KEY) || null;
    const item = window.localStorage.getItem(DESCARTADAS_KEY);
    descartadas = item ? JSON.parse(item) : [];
  } catch {
    // ignore storage errors
  }
  return { ultimaVista, descartadas };
};

const useNotificacionesStore = create((set, get) => ({
  ...loadInitialState(),
  marcarVistas: () => {
    const next = new Date().toISOString();
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // ignore storage errors
    }
    set({ ultimaVista: next });
  },
  descartar: (id) => {
    const next = [...new Set([...get().descartadas, id])];
    try {
      window.localStorage.setItem(DESCARTADAS_KEY, JSON.stringify(next));
    } catch {
      // ignore storage errors
    }
    set({ descartadas: next });
  },
  descartarTodas: (ids) => {
    const next = [...new Set([...get().descartadas, ...ids])];
    try {
      window.localStorage.setItem(DESCARTADAS_KEY, JSON.stringify(next));
    } catch {
      // ignore storage errors
    }
    set({ descartadas: next });
  },
}));

export default useNotificacionesStore;
