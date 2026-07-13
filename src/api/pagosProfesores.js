import client from './client';

export async function getPagosProfesores(params = {}) {
  const { data } = await client.get('/pagos-profesores', { params });
  return data;
}

export async function getPagoProfesor(id) {
  const { data } = await client.get(`/pagos-profesores/${id}`);
  return data;
}

export async function generarPagosProfesores(payload) {
  const { data } = await client.post('/pagos-profesores/generar', payload);
  return data;
}

export async function actualizarPagoProfesor(id, payload) {
  const { data } = await client.put(`/pagos-profesores/${id}`, payload);
  return data;
}

export async function eliminarPagoProfesor(id) {
  const { data } = await client.delete(`/pagos-profesores/${id}`);
  return data;
}
