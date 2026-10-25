import { test, expect } from '@playwright/test';
import { crearAlumnoCompleto, eliminarAlumno } from './api-helpers.js';

// El correo de un estudiante o de un profesor es opcional en los formularios, pero el backend lo rechazaba
// con 422 "Email inválido" cuando venía vacío: no se podía guardar a nadie sin correo y el aviso era genérico.
const API_URL = 'http://localhost:3000/api';

const alumnosCreados = [];
const profesoresCreados = [];

test.afterAll(async ({ request }) => {
  for (const id of alumnosCreados) await eliminarAlumno(request, id);
  for (const id of profesoresCreados) await request.delete(`${API_URL}/profesores/${id}`);
});

test('se puede crear un estudiante sin correo desde el formulario', async ({ page, request }) => {
  await page.goto('/alumnos/nuevo');
  await page.getByPlaceholder('Ej: María González Pérez').fill(`E2E SinCorreo ${Date.now()}`);
  await page.getByPlaceholder('9 1234 5678').fill('912345678');

  const respuesta = page.waitForResponse((r) => r.url().includes('/alumnos/completo') && r.request().method() === 'POST');
  await page.getByRole('button', { name: 'Guardar Estudiante' }).click();
  const res = await respuesta;
  expect(res.status(), await res.text()).toBe(201);
  await expect(page.getByText('Estudiante creado exitosamente')).toBeVisible();

  await page.waitForURL(/\/alumnos\/\d+$/);
  const id = Number(page.url().split('/').pop());
  alumnosCreados.push(id);
  const alumno = (await (await request.get(`${API_URL}/alumnos/${id}`)).json()).data;
  expect(alumno.email).toBeNull();
});

test('se puede quitar el correo de un estudiante desde el formulario de edición', async ({ page, request }) => {
  const alumno = await crearAlumnoCompleto(request, { nombre: `E2E QuitarCorreo ${Date.now()}` });
  alumnosCreados.push(alumno.id);
  expect((await (await request.get(`${API_URL}/alumnos/${alumno.id}`)).json()).data.email).toContain('@');

  await page.goto(`/alumnos/${alumno.id}/editar`);
  const correo = page.getByPlaceholder('correo@ejemplo.com');
  await expect(correo).not.toHaveValue('');
  await correo.fill('');

  const respuesta = page.waitForResponse((r) => r.url().endsWith(`/alumnos/${alumno.id}`) && r.request().method() === 'PUT');
  await page.getByRole('button', { name: 'Guardar Cambios' }).click();
  const res = await respuesta;
  expect(res.status(), await res.text()).toBe(200);
  await expect(page.getByText('Estudiante actualizado exitosamente')).toBeVisible();

  expect((await (await request.get(`${API_URL}/alumnos/${alumno.id}`)).json()).data.email).toBeNull();
});

test('un correo mal escrito sigue siendo rechazado', async ({ request }) => {
  const res = await request.post(`${API_URL}/alumnos/completo`, {
    data: { nombre: 'E2E CorreoMalo', telefono: '+56912345678', email: 'no-es-un-correo', fecha_ingreso: '2026-01-01', programas: [] },
  });
  expect(res.status()).toBe(422);
});

test('un profesor se puede crear y editar con el correo vacío (lo que manda su formulario)', async ({ request }) => {
  const crear = await request.post(`${API_URL}/profesores`, {
    data: { nombre: 'E2E', apellido: `SinCorreo${Date.now()}`, tarifa_hora_clp: 8000, email: '' },
  });
  expect(crear.status(), await crear.text()).toBe(201);
  const profesor = (await crear.json()).data;
  profesoresCreados.push(profesor.id);
  expect(profesor.email).toBeNull();

  const editar = await request.put(`${API_URL}/profesores/${profesor.id}`, { data: { email: '', titulo: 'Prof.' } });
  expect(editar.status(), await editar.text()).toBe(200);
  expect((await editar.json()).data.email).toBeNull();
});
