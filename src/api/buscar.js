import client from './client';

export async function buscarGlobal(q) {
  const { data } = await client.get('/buscar', { params: { q } });
  return data;
}
