import { apiBaseURL } from '../api/client';

// apiBaseURL termina en "/api" (ej: https://dominio.com/api); los archivos
// subidos (fotos de profesores) se sirven en la raíz del backend bajo
// /uploads, por eso se le saca el sufijo "/api" antes de anteponer la ruta.
const assetBaseURL = apiBaseURL.replace(/\/api\/?$/, '');

export function urlFoto(fotoUrl) {
  if (!fotoUrl) return null;
  if (/^https?:\/\//.test(fotoUrl)) return fotoUrl;
  return `${assetBaseURL}${fotoUrl}`;
}
