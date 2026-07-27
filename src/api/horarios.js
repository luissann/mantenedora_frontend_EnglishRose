import client from './client';

export async function getHorarios(params = {}) {
  const { data } = await client.get('/horarios', { params });
  return data;
}

export async function getHorariosPorAlumno(idAlumno) {
  const { data } = await client.get(`/horarios/alumno/${idAlumno}`);
  return data;
}

export async function getHorariosPorPrograma(idAlumnoPrograma) {
  const { data } = await client.get(`/horarios/programa/${idAlumnoPrograma}`);
  return data;
}

export async function getHorario(id) {
  const { data } = await client.get(`/horarios/${id}`);
  return data;
}

export async function crearHorario(payload) {
  const { data } = await client.post('/horarios', payload);
  return data;
}

export async function actualizarHorario(id, payload) {
  const { data } = await client.put(`/horarios/${id}`, payload);
  return data;
}

export async function eliminarHorario(id) {
  const { data } = await client.delete(`/horarios/${id}`);
  return data;
}
