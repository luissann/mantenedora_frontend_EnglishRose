import client from './client';

export async function getPlanes(params = {}) {
  const { data } = await client.get('/planes', { params });
  return data;
}

export async function getPlan(id) {
  const { data } = await client.get(`/planes/${id}`);
  return data;
}

export async function crearPlan(payload) {
  const { data } = await client.post('/planes', payload);
  return data;
}

export async function actualizarPlan(id, payload) {
  const { data } = await client.put(`/planes/${id}`, payload);
  return data;
}

export async function eliminarPlan(id) {
  const { data } = await client.delete(`/planes/${id}`);
  return data;
}
