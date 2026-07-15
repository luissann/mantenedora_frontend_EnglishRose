import client from './client';

export async function getAlumnoProgramasPorAlumno(idAlumno) {
  const { data } = await client.get(`/alumnos/${idAlumno}/programas`);
  return data;
}

export async function getAlumnoPrograma(id) {
  const { data } = await client.get(`/alumno-programas/${id}`);
  return data;
}

export async function crearAlumnoPrograma(payload) {
  const { data } = await client.post('/alumno-programas', payload);
  return data;
}

export async function actualizarAlumnoPrograma(id, payload) {
  const { data } = await client.put(`/alumno-programas/${id}`, payload);
  return data;
}

export async function eliminarAlumnoPrograma(id) {
  const { data } = await client.delete(`/alumno-programas/${id}`);
  return data;
}
