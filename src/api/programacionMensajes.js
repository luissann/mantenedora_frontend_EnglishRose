import client from './client';

export async function getProgramacionMensajes(params = {}) {
  const { data } = await client.get('/programacion-mensajes', { params });
  return data;
}

export async function getProgramacionMensaje(id) {
  const { data } = await client.get(`/programacion-mensajes/${id}`);
  return data;
}

export async function crearProgramacionMensaje(payload) {
  const { data } = await client.post('/programacion-mensajes', payload);
  return data;
}

export async function actualizarProgramacionMensaje(id, payload) {
  const { data } = await client.put(`/programacion-mensajes/${id}`, payload);
  return data;
}

export async function eliminarProgramacionMensaje(id) {
  const { data } = await client.delete(`/programacion-mensajes/${id}`);
  return data;
}
