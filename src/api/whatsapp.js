import client from './client';

export async function getWhatsappEstado() {
  const { data } = await client.get('/whatsapp/estado');
  return data;
}

export async function reiniciarWhatsapp() {
  const { data } = await client.post('/whatsapp/reiniciar');
  return data;
}
