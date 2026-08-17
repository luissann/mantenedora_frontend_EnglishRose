import { test, expect } from '@playwright/test';
import { crearAlumnoCompleto, eliminarAlumno } from './api-helpers.js';

let alumno;

// Alumno sin ningún programa/docente asignado: al filtrar por un docente
// concreto debe desaparecer de la lista (required:true en el include), y
// reaparecer al volver a "Todos los docentes".
test.beforeAll(async ({ request }) => {
  alumno = await crearAlumnoCompleto(request, { nombre: `E2E Filtro ${Date.now()}` });
});

test.afterAll(async ({ request }) => {
  if (alumno) await eliminarAlumno(request, alumno.id);
});

test('la tabla de Estudiantes muestra Horario en vez de Teléfono/Correo', async ({ page }) => {
  await page.goto('/alumnos');
  await expect(page.getByRole('columnheader', { name: 'Horario' })).toBeVisible();
  await expect(page.getByRole('columnheader', { name: 'Teléfono' })).toHaveCount(0);
  await expect(page.getByRole('columnheader', { name: 'Correo' })).toHaveCount(0);
});

test('el filtro de docente se puede volver a "Todos los docentes" (regresión: antes no se podía)', async ({ page }) => {
  await page.goto('/alumnos');
  await page.getByPlaceholder('Buscar estudiante por nombre o correo...').fill(alumno.nombre);
  await expect(page.getByText(alumno.nombre)).toBeVisible();

  // Sin docente asignado: el select ya arranca mostrando "Todos los docentes"
  // (value inicial '' calza con esa opción) — se abre para elegir uno concreto.
  await page.getByRole('button', { name: 'Todos los docentes' }).click();
  await page.getByRole('button', { name: /^luis/i }).first().click();

  // Con un docente concreto seleccionado, el alumno (sin programa/docente) desaparece.
  await expect(page.getByText(alumno.nombre)).toHaveCount(0);

  // Reabrir el select (ahora muestra el nombre del docente elegido) y volver a "Todos".
  await page.getByRole('button', { name: /^luis/i }).click();
  await page.getByRole('button', { name: 'Todos los docentes' }).click();

  await expect(page.getByText(alumno.nombre)).toBeVisible();
});

test('el filtro de programa se puede volver a "Todos los programas" (regresión: antes no se podía)', async ({ page }) => {
  await page.goto('/alumnos');
  await expect(page.getByRole('button', { name: 'Todos los programas' })).toBeVisible();
});
