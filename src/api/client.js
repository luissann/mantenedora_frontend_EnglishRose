import axios from 'axios';
import useAuthStore from '../store/authStore';
import useSystemStatusStore from '../store/systemStatusStore';

const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  // La sesión viaja en una cookie httpOnly (ver authStore.js) — el
  // navegador necesita esto para enviarla en cada request.
  withCredentials: true,
});

client.interceptors.response.use(
  (response) => {
    // Si llegó una respuesta, el backend está vivo — limpiar cualquier
    // estado de "caído" que hubiera quedado de un fallo anterior.
    useSystemStatusStore.getState().marcarRecuperado();
    return response;
  },
  (error) => {
    if (
      error.response?.status === 401 &&
      error.config?.url !== '/auth/login'
    ) {
      useAuthStore.getState().logout();
    }

    // Sin error.response = la request nunca llegó a tener respuesta del
    // servidor (caído, sin red, timeout) — distinto de un 4xx/5xx normal,
    // donde el backend sí está vivo y solo rechazó esa request puntual.
    if (!error.response) {
      useSystemStatusStore.getState().marcarCaido();
    }

    return Promise.reject(error);
  }
);

export default client;
