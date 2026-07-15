import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

export const formatCLP = (n) => `$${Number(n).toLocaleString('es-CL')}`;

export const formatUSD = (n) => `USD $${Number(n).toFixed(2)}`;

// `new Date('2026-07-14')` interpreta fechas "solo fecha" (sin hora) como
// medianoche UTC — al mostrarlas en hora de Chile (UTC-3/-4) se corren un
// día para atrás. `parseISO` sí las trata como medianoche LOCAL, que es lo
// correcto para un DATEONLY (fecha_envio, fecha_ingreso, fecha_pago, etc.).
const toDate = (d) => (d instanceof Date ? d : parseISO(d));

export const formatDate = (d) => {
  if (!d) return '-';
  return format(toDate(d), 'dd/MM/yyyy', { locale: es });
};

export const formatDateLong = (d) => {
  if (!d) return '-';
  return format(toDate(d), "EEEE, d 'de' MMMM 'de' yyyy", { locale: es });
};

export const formatRUT = (rut) => {
  const clean = String(rut).replace(/[^0-9kK]/g, '');
  if (clean.length < 2) return clean;
  const dv = clean.slice(-1);
  const body = clean.slice(0, -1).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${body}-${dv}`;
};

export const formatTime = (time) => {
  if (!time) return '-';
  return String(time).slice(0, 5);
};

export const formatDateTime = (d) => {
  if (!d) return '-';
  return format(toDate(d), "dd/MM/yyyy HH:mm", { locale: es });
};
