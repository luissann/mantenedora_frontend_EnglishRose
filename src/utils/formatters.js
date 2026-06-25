import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export const formatCLP = (n) => `$${Number(n).toLocaleString('es-CL')}`;

export const formatUSD = (n) => `USD $${Number(n).toFixed(2)}`;

export const formatDate = (d) => {
  if (!d) return '-';
  return format(new Date(d), 'dd/MM/yyyy', { locale: es });
};

export const formatDateLong = (d) => {
  if (!d) return '-';
  return format(new Date(d), "EEEE, d 'de' MMMM 'de' yyyy", { locale: es });
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
