import client from './client';

export async function getProgramacionMensajes(params = {}) {
  const { data } = await client.get('/programacion', { params });
  return data;
}

export async function getCalendarioMensual(anio, mes) {
  const { data } = await client.get('/programacion/calendario', { params: { anio, mes } });
  return data;
}

export async function getProgramacionMensaje(id) {
  const { data } = await client.get(`/programacion/${id}`);
  return data;
}

export async function crearProgramacionMensaje(payload) {
  const { data } = await client.post('/programacion', payload);
  return data;
}

export async function actualizarProgramacionMensaje(id, payload) {
  const { data } = await client.put(`/programacion/${id}`, payload);
  return data;
}

export async function eliminarProgramacionMensaje(id) {
  const { data } = await client.delete(`/programacion/${id}`);
  return data;
}

export async function getNotificaciones(params = {}) {
  const { data } = await client.get('/notificaciones', { params });
  return data;
}

export async function enviarWhatsappAhora(idAlumno) {
  const { data } = await client.post(`/alumnos/${idAlumno}/whatsapp/enviar-ahora`);
  return data;
}
