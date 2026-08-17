import { test, expect } from '@playwright/test';
import { crearAlumnoCompleto, eliminarAlumno } from './api-helpers.js';

let alumno;

// Alumno con día de envío configurado: al crearlo vía /alumnos/completo el
// backend le asegura una ProgramacionMensaje PENDIENTE activa automática
// (ver ProgramacionMensajeService.asegurarProgramacionParaAlumno).
test.beforeEach(async ({ request }) => {
  alumno = await crearAlumnoCompleto(request, { nombre: `E2E Envio ${Date.now()}` });
});

test.afterEach(async ({ request }) => {
  if (alumno) await eliminarAlumno(request, alumno.id);
});

test('al pausar el envío desaparece el texto "Próximo" (regresión: antes seguía mostrándose)', async ({ page }) => {
  await page.goto('/alumnos');
  await page.getByPlaceholder('Buscar estudiante por nombre o correo...').fill(alumno.nombre);

  const fila = page.getByRole('row', { name: new RegExp(alumno.nombre) });
  await expect(fila.getByText(/^Próximo:/)).toBeVisible();

  // Ya está activo ("Enviar" es el estado actual) — pausarlo con "Pausado".
  await fila.getByRole('button', { name: 'Pausado' }).click();
  await expect(fila.getByText(/^Próximo:/)).toHaveCount(0);
});

test('al reanudar el envío pausado vuelve a mostrarse "Próximo"', async ({ page }) => {
  await page.goto('/alumnos');
  await page.getByPlaceholder('Buscar estudiante por nombre o correo...').fill(alumno.nombre);

  const fila = page.getByRole('row', { name: new RegExp(alumno.nombre) });
  await fila.getByRole('button', { name: 'Pausado' }).click();
  await expect(fila.getByText(/^Próximo:/)).toHaveCount(0);

  await fila.getByRole('button', { name: 'Enviar' }).click();
  await expect(fila.getByText(/^Próximo:/)).toBeVisible();
});
