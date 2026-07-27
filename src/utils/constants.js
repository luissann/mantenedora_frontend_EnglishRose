export const DIAS_SEMANA = ['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO', 'DOMINGO'];

export const DIAS_DISPLAY = {
  LUNES: 'Lunes',
  MARTES: 'Martes',
  MIERCOLES: 'Miércoles',
  JUEVES: 'Jueves',
  VIERNES: 'Viernes',
  SABADO: 'Sábado',
  DOMINGO: 'Domingo',
};

// getDay(): 0=Domingo, 1=Lunes, ... 6=Sábado
const DIA_POR_GETDAY = ['DOMINGO', 'LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO'];

export function diaSemanaDesdeFecha(fecha) {
  return DIA_POR_GETDAY[fecha.getDay()];
}

/** Próxima fecha (hoy o futura) que cae en el día de la semana dado, para mostrar en el calendario. */
export function proximaFechaParaDia(diaSemana) {
  const hoy = new Date();
  const objetivo = DIA_POR_GETDAY.indexOf(diaSemana);
  if (objetivo === -1) return hoy;
  const diff = (objetivo - hoy.getDay() + 7) % 7;
  const fecha = new Date(hoy);
  fecha.setDate(hoy.getDate() + diff);
  return fecha;
}

export const ESTADOS_PAGO = ['PAGADO', 'PENDIENTE', 'VENCIDO'];

// Por ahora sólo existe el rol Admin — se ampliará cuando se definan
// los demás roles (Coordinador/Profesor/Personal).
export const ROLES_USUARIO = ['Admin'];

export const ROLES_USUARIO_LABELS = {
  Admin: 'Administrador',
  Coordinator: 'Coordinador',
  Teacher: 'Profesor',
  Staff: 'Personal',
};

export const ESTADO_BADGE = {
  PAGADO: { label: 'Pagado', className: 'bg-green-100 text-green-800' },
  PENDIENTE: { label: 'Pendiente', className: 'bg-yellow-100 text-yellow-800' },
  VENCIDO: { label: 'Vencido', className: 'bg-red-100 text-red-800' },
  Paid: { label: 'Paid', className: 'bg-green-100 text-green-800' },
  Pending: { label: 'Pending', className: 'bg-yellow-100 text-yellow-800' },
  Overdue: { label: 'Overdue', className: 'bg-red-100 text-red-800' },
  Active: { label: 'Activo', className: 'bg-green-100 text-green-800' },
  Inactive: { label: 'Inactivo', className: 'bg-gray-100 text-gray-600' },
  Programado: { label: 'Programado', className: 'bg-blue-100 text-blue-800' },
  Enviado: { label: 'Enviado', className: 'bg-green-100 text-green-800' },
  Fallido: { label: 'Fallido', className: 'bg-red-100 text-red-800' },
};
