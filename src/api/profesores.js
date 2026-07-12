import client from './client';

export async function getProfesores(params = {}) {
  const { data } = await client.get('/profesores', { params });
  return data;
}

export async function getProfesor(id) {
  const { data } = await client.get(`/profesores/${id}`);
  return data;
}

export async function crearProfesor(payload) {
  const { data } = await client.post('/profesores', payload);
  return data;
}

export async function actualizarProfesor(id, payload) {
  const { data } = await client.put(`/profesores/${id}`, payload);
  return data;
}

export async function eliminarProfesor(id) {
  const { data } = await client.delete(`/profesores/${id}`);
  return data;
}
