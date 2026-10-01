import client from './client';

// Contenido editable de la landing ("Editar web")
export async function getSitio() {
  const { data } = await client.get('/sitio');
  return data;
}

export async function guardarSitio(clave, valor) {
  const { data } = await client.put(`/sitio/${clave}`, { valor });
  return data;
}

export async function restaurarSitio(clave) {
  const { data } = await client.delete(`/sitio/${clave}`);
  return data;
}
