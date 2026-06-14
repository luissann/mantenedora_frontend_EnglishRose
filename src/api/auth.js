import client from './client';

export async function login(rut, password) {
  const { data } = await client.post('/auth/login', {
    rut,
    password,
  });

  return data;
}

export async function getPerfil() {
  const { data } = await client.get('/auth/perfil');
  return data;
}