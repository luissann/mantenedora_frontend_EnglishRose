import client from './client';

export async function getConfiguracionSistema() {
  const { data } = await client.get('/configuracion-sistema');
  return data;
}

export async function actualizarConfiguracionSistema(payload) {
  const { data } = await client.put('/configuracion-sistema', payload);
  return data;
}
