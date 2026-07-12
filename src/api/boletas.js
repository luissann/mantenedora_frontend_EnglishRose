import client from './client';

export async function getBoletas(params = {}) {
  const { data } = await client.get('/boletas', { params });
  return data;
}

export async function getBoleta(id) {
  const { data } = await client.get(`/boletas/${id}`);
  return data;
}

export async function generarBoletas(payload) {
  const { data } = await client.post('/boletas/generar', payload);
  return data;
}

export async function actualizarBoleta(id, payload) {
  const { data } = await client.put(`/boletas/${id}`, payload);
  return data;
}

export async function eliminarBoleta(id) {
  const { data } = await client.delete(`/boletas/${id}`);
  return data;
}

export async function getResumenBoletas(params = {}) {
  const { data } = await client.get('/boletas/resumen', { params });
  return data;
}
