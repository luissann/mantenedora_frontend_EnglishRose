import client from './client';

export async function getPagos(params = {}) {
  const { data } = await client.get('/pagos', { params });
  return data;
}

export async function getPago(id) {
  const { data } = await client.get(`/pagos/${id}`);
  return data;
}

export async function crearPago(payload) {
  const { data } = await client.post('/pagos', payload);
  return data;
}

export async function actualizarPago(id, payload) {
  const { data } = await client.put(`/pagos/${id}`, payload);
  return data;
}

export async function eliminarPago(id) {
  const { data } = await client.delete(`/pagos/${id}`);
  return data;
}
