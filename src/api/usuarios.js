import client from './client';

export async function getUsuarios(params = {}) {
  const { data } = await client.get('/usuarios', { params });
  return data;
}

export async function getUsuario(id) {
  const { data } = await client.get(`/usuarios/${id}`);
  return data;
}

export async function crearUsuario(payload) {
  const { data } = await client.post('/usuarios', payload);
  return data;
}

export async function actualizarUsuario(id, payload) {
  const { data } = await client.put(`/usuarios/${id}`, payload);
  return data;
}

export async function eliminarUsuario(id) {
  const { data } = await client.delete(`/usuarios/${id}`);
  return data;
}
