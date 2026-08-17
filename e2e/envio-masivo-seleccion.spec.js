import { test, expect } from '@playwright/test';
import { crearAlumnoCompleto, eliminarAlumno } from './api-helpers.js';

let alumno;

test.beforeEach(async ({ request }) => {
  alumno = await crearAlumnoCompleto(request, { nombre: `E2E Casillas ${Date.now()}` });
});

test.afterEach(async ({ request }) => {
  if (alumno) await eliminarAlumno(request, alumno.id);
});

test('tildar un alumno y elegir "Solo los seleccionados" habilita Guardar y persiste la selección', async ({ page }) => {
  await page.goto('/alumnos');
  await page.getByPlaceholder('Buscar estudiante por nombre o correo...').fill(alumno.nombre);

  const fila = page.getByRole('row', { name: new RegExp(alumno.nombre) });
  await fila.locator('input[type="checkbox"]').click();

  await page.getByRole('button', { name: 'Configurar envío masivo' }).click();

  const modal = page.locator('.fixed.inset-0');
  await modal.getByRole('button', { name: /activos|inactivos|Todos|seleccionados/ }).click();
  await page.getByRole('button', { name: /Solo los seleccionados con casillas \(1\)/ }).last().click();

  const guardar = page.getByRole('button', { name: 'Guardar y activar' });
  await expect(guardar).toBeEnabled();
  await guardar.click();

  await expect(page.getByText('Configuración actualizada')).toBeVisible();
  // Al guardar, la tabla limpia la selección (casillas vuelven a quedar sin tildar).
  await expect(fila.locator('input[type="checkbox"]')).not.toBeChecked();
});

test('el botón de guardar queda deshabilitado si eliges "Solo los seleccionados" sin tildar a nadie', async ({ page }) => {
  await page.goto('/alumnos');
  await page.getByRole('button', { name: 'Configurar envío masivo' }).click();

  const modal = page.locator('.fixed.inset-0');
  await modal.getByRole('button', { name: /activos|inactivos|Todos|seleccionados/ }).click();
  await page.getByRole('button', { name: /Solo los seleccionados con casillas \(0\)/ }).last().click();

  await expect(page.getByRole('button', { name: 'Guardar y activar' })).toBeDisabled();
  await expect(page.getByText('No hay ningún estudiante tildado')).toBeVisible();
});
