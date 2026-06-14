import { create } from 'zustand';

const STORAGE_KEY = 'sofi-rose-auth';

const loadInitialState = () => {
  try {
    const item = window.localStorage.getItem(STORAGE_KEY);
    if (!item) return { token: null, usuario: null, isAuthenticated: false };
    const parsed = JSON.parse(item);
    return {
      ...parsed,
      isAuthenticated: Boolean(parsed?.token),
    };
  } catch {
    return { token: null, usuario: null, isAuthenticated: false };
  }
};

const saveState = (state) => {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore storage errors
  }
};

const useAuthStore = create((set) => ({
  ...loadInitialState(),
  login: (token, usuario) => {
    const next = { token, usuario, isAuthenticated: true };
    set(next);
    saveState(next);
  },
  logout: () => {
    const next = { token: null, usuario: null, isAuthenticated: false };
    set(next);
    saveState(next);
  },
}));

export default useAuthStore;
