import { create } from 'zustand';

const STORAGE_KEY = 'sofi-rose-auth';

// La sesión real vive en una cookie httpOnly que este código ya no puede
// leer ni escribir — eso es intencional (mitiga robo de token vía XSS).
// Lo que se persiste acá es solo el perfil del usuario, para no mostrar la
// pantalla de login en cada refresh; si la cookie ya expiró, la primera
// petición protegida responde 401 y el interceptor de `api/client.js` llama
// a `logout()` para reflejarlo en la UI.
const loadInitialState = () => {
  try {
    const item = window.localStorage.getItem(STORAGE_KEY);
    if (!item) return { usuario: null, isAuthenticated: false };
    const parsed = JSON.parse(item);
    return {
      usuario: parsed?.usuario ?? null,
      isAuthenticated: Boolean(parsed?.usuario),
    };
  } catch {
    return { usuario: null, isAuthenticated: false };
  }
};

const saveState = (state) => {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore storage errors
  }
};

const notificarLogoutAlServidor = () => {
  const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
  fetch(`${baseURL}/auth/logout`, { method: 'POST', credentials: 'include' }).catch(() => {
    // best-effort: si falla, la cookie igual expira sola
  });
};

const useAuthStore = create((set, get) => ({
  ...loadInitialState(),
  login: (usuario) => {
    const next = { usuario, isAuthenticated: true };
    set(next);
    saveState(next);
  },
  updateUsuario: (usuarioActualizado) => {
    const current = get();
    const next = {
      ...current,
      usuario: current.usuario ? { ...current.usuario, ...usuarioActualizado } : usuarioActualizado,
      isAuthenticated: Boolean(current.usuario || current.isAuthenticated),
    };
    set(next);
    saveState(next);
  },
  logout: () => {
    notificarLogoutAlServidor();
    const next = { usuario: null, isAuthenticated: false };
    set(next);
    saveState(next);
  },
}));

export default useAuthStore;
