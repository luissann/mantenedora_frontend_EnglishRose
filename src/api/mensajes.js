import client from './client';

export async function getMensajes(params = {}) {
  const { data } = await client.get('/mensajes', { params });
  return data;
}

export async function getResumenMensajes() {
  const { data } = await client.get('/mensajes/resumen');
  return data;
}

export async function marcarLeidoMensaje(id, leido) {
  const { data } = await client.patch(`/mensajes/${id}/leido`, { leido });
  return data;
}

export async function eliminarMensaje(id) {
  const { data } = await client.delete(`/mensajes/${id}`);
  return data;
}
