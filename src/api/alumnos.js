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

// Crea el alumno junto con sus programas y horarios en una sola llamada
// atómica (el backend lo hace todo dentro de una transacción): si algo
// falla (frecuencia excedida, horario duplicado, 4to programa activo, etc.)
// no queda un alumno a medio crear.
export async function crearAlumnoCompleto(payload) {
  const { data } = await client.post('/alumnos/completo', payload);
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
