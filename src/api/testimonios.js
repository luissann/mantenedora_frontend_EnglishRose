import client from './client';

export async function getTestimonios(params = {}) {
  const { data } = await client.get('/testimonios', { params });
  return data;
}

export async function getResumenTestimonios() {
  const { data } = await client.get('/testimonios/resumen');
  return data;
}

export async function cambiarEstadoTestimonio(id, estado) {
  const { data } = await client.patch(`/testimonios/${id}/estado`, { estado });
  return data;
}

export async function actualizarTestimonio(id, payload) {
  const { data } = await client.put(`/testimonios/${id}`, payload);
  return data;
}

export async function eliminarTestimonio(id) {
  const { data } = await client.delete(`/testimonios/${id}`);
  return data;
}
