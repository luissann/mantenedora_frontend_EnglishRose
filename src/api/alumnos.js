import client from './client';

export async function getAlumnos(params = {}) {
  const { data } = await client.get('/alumnos', { params });
  return data;
}

export async function getAlumno(id) {
  const { data } = await client.get(`/alumnos/${id}`);
  return data;
}

export async function getAlumnoCompleto(id) {
  const { data } = await client.get(`/alumnos/${id}/completo`);
  return data;
}

export async function crearAlumno(payload) {
  const { data } = await client.post('/alumnos', payload);
  return data;
}

export async function actualizarAlumno(id, payload) {
  const { data } = await client.put(`/alumnos/${id}`, payload);
  return data;
}

export async function eliminarAlumno(id) {
  const { data } = await client.delete(`/alumnos/${id}`);
  return data;
}
