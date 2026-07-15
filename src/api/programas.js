import client from './client';

export async function getProgramas(params = {}) {
  const { data } = await client.get('/programas', { params });
  return data;
}

export async function getPrograma(id) {
  const { data } = await client.get(`/programas/${id}`);
  return data;
}

export async function crearPrograma(payload) {
  const { data } = await client.post('/programas', payload);
  return data;
}

export async function actualizarPrograma(id, payload) {
  const { data } = await client.put(`/programas/${id}`, payload);
  return data;
}

export async function eliminarPrograma(id) {
  const { data } = await client.delete(`/programas/${id}`);
  return data;
}
