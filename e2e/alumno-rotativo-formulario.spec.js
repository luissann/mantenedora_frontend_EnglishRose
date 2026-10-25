import { test, expect } from '@playwright/test';
import { crearAlumnoCompleto, eliminarAlumno } from './api-helpers.js';

// Guardar un turno ROTATIVO desde los formularios de Estudiantes (editar y crear).
// Antes el formulario exigía "hora de inicio" también para el rotativo (que no tiene hora) y
// enviaba hora_fin: null (que el backend rechaza con 422): al pulsar Guardar no pasaba nada.
// El horario rotativo se creaba por API en los otros E2E, así que nunca se probó guardarlo desde el formulario.
const API_URL = 'http://localhost:3000/api';
const PREGUNTA = '¿Qué días puedes esta semana?';
const PLACEHOLDER_ROTATIVO = '¿Qué días puedes esta semana?';

const creados = [];

async function programaActivoId(request) {
  const r = await request.get(`${API_URL}/programas?activo=true&limit=1`);
  return (await r.json()).data?.[0]?.id;
}

async function horariosDe(request, idAlumno) {
  const r = await request.get(`${API_URL}/horarios/alumno/${idAlumno}`);
  return (await r.json()).data || [];
}

test.afterAll(async ({ request }) => {
  for (const id of creados) await eliminarAlumno(request, id);
});

test('se puede guardar un estudiante que ya tiene un rotativo (cambiando su pregunta)', async ({ page, request }) => {
  const idPrograma = await programaActivoId(request);
  const alumno = await crearAlumnoCompleto(request, {
    nombre: `E2E RotEditar ${Date.now()}`,
    programas: [{ id_programa: idPrograma, frecuencia: 2, horarios: [
      { dia_semana: 'MARTES', hora_inicio: '10:00', hora_fin: '11:00' },
      { dia_semana: 'ROTATIVO', detalle: PREGUNTA },
    ] }],
  });
  creados.push(alumno.id);

  await page.goto(`/alumnos/${alumno.id}/editar`);
  const pregunta = page.getByPlaceholder(PLACEHOLDER_ROTATIVO);
  await expect(pregunta).toHaveValue(PREGUNTA);
  await pregunta.fill('¿Qué días y horas te acomodan esta semana?');

  await page.getByRole('button', { name: 'Guardar Cambios' }).click();
  await expect(page.getByText('Estudiante actualizado exitosamente')).toBeVisible();

  const horarios = await horariosDe(request, alumno.id);
  const rotativo = horarios.find((h) => h.dia_semana === 'ROTATIVO');
  expect(rotativo.detalle).toBe('¿Qué días y horas te acomodan esta semana?');
  expect(rotativo.hora_inicio).toBeNull();
  expect(horarios.find((h) => h.dia_semana === 'MARTES').hora_inicio).toBe('10:00:00');
});

test('cambiar un día normal a Rotativo desde el formulario lo guarda sin hora', async ({ page, request }) => {
  const idPrograma = await programaActivoId(request);
  const alumno = await crearAlumnoCompleto(request, {
    nombre: `E2E ANormal ${Date.now()}`,
    programas: [{ id_programa: idPrograma, frecuencia: 1, horarios: [
      { dia_semana: 'JUEVES', hora_inicio: '16:00', hora_fin: '17:00', detalle: 'con fono' },
    ] }],
  });
  creados.push(alumno.id);

  await page.goto(`/alumnos/${alumno.id}/editar`);
  const selectorDia = page.locator('table select').first();
  await expect(selectorDia).toHaveValue('JUEVES');
  await selectorDia.selectOption('ROTATIVO');

  // sin hora, y el detalle pasa a ser la pregunta
  await expect(page.getByText('Sin hora fija')).toBeVisible();
  const pregunta = page.getByPlaceholder(PLACEHOLDER_ROTATIVO);
  await pregunta.fill(PREGUNTA);

  await page.getByRole('button', { name: 'Guardar Cambios' }).click();
  await expect(page.getByText('Estudiante actualizado exitosamente')).toBeVisible();

  const [horario] = await horariosDe(request, alumno.id);
  expect(horario.dia_semana).toBe('ROTATIVO');
  expect(horario.hora_inicio).toBeNull();
  expect(horario.hora_fin).toBeNull();
  expect(horario.detalle).toBe(PREGUNTA);
});

test('volver de Rotativo a un día normal vuelve a pedir y guardar la hora', async ({ page, request }) => {
  const idPrograma = await programaActivoId(request);
  const alumno = await crearAlumnoCompleto(request, {
    nombre: `E2E ANormal2 ${Date.now()}`,
    programas: [{ id_programa: idPrograma, frecuencia: 1, horarios: [{ dia_semana: 'ROTATIVO', detalle: PREGUNTA }] }],
  });
  creados.push(alumno.id);

  await page.goto(`/alumnos/${alumno.id}/editar`);
  await page.locator('table select').first().selectOption('VIERNES');
  const hora = page.locator('table input[type="time"]').first();
  await expect(hora).toBeVisible();
  await hora.fill('18:30');

  await page.getByRole('button', { name: 'Guardar Cambios' }).click();
  await expect(page.getByText('Estudiante actualizado exitosamente')).toBeVisible();

  const [horario] = await horariosDe(request, alumno.id);
  expect(horario.dia_semana).toBe('VIERNES');
  expect(horario.hora_inicio).toBe('18:30:00');
  expect(horario.hora_fin).toBe('19:30:00');
});

test('si el formulario no pasa la validación avisa con un mensaje (no se queda mudo)', async ({ page, request }) => {
  const idPrograma = await programaActivoId(request);
  const alumno = await crearAlumnoCompleto(request, {
    nombre: `E2E Invalido ${Date.now()}`,
    programas: [{ id_programa: idPrograma, frecuencia: 2, horarios: [
      { dia_semana: 'LUNES', hora_inicio: '09:00', hora_fin: '10:00' },
      { dia_semana: 'MARTES', hora_inicio: '09:00', hora_fin: '10:00' },
    ] }],
  });
  creados.push(alumno.id);
  await page.goto(`/alumnos/${alumno.id}/editar`);

  // Caso 1: un día normal sin hora → avisa, y el foco va al campo con error (ahí se ve el problema).
  const hora = page.locator('table input[type="time"]').first();
  await hora.fill('');
  await page.getByRole('button', { name: 'Guardar Cambios' }).click();
  await expect(page.getByText('No se guardó: hay campos por revisar')).toBeVisible();
  await expect(page.getByText('Hora de inicio requerida')).toBeVisible();
  await expect(hora).toBeFocused();

  // Caso 2: error sin campo al que ir (más horarios que la frecuencia) → avisa y sube al resumen de errores.
  await hora.fill('09:00');
  await page.getByLabel('Frecuencia (clases/semana)').fill('1');
  await page.getByRole('button', { name: 'Guardar Cambios' }).click();
  await expect(page.getByText(/Cargaste 2 horario\(s\) pero la frecuencia definida es 1/).first()).toBeVisible();
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeLessThan(100);
});

test('crear un estudiante nuevo con un horario Rotativo desde el formulario', async ({ page, request }) => {
  const nombre = `E2E RotNuevo ${Date.now()}`;
  await page.goto('/alumnos/nuevo');

  await page.getByPlaceholder('Ej: María González Pérez').fill(nombre);
  await page.getByPlaceholder('9 1234 5678').fill('912345678');
  await page.getByPlaceholder('correo@ejemplo.com').fill(`rotnuevo${Date.now()}@e2e.test`); // hoy el backend exige correo (ver nota en el informe)

  await page.getByRole('button', { name: 'Nuevo Programa' }).click();
  await page.getByRole('button', { name: 'Seleccionar programa...' }).click();
  await page.locator('div.absolute.z-20 button').first().click();

  await page.getByRole('button', { name: 'Añadir Horario' }).click();
  await page.locator('table select').first().selectOption('ROTATIVO');
  await expect(page.getByText('Sin hora fija')).toBeVisible();
  await page.getByPlaceholder(PLACEHOLDER_ROTATIVO).fill(PREGUNTA);

  const respuesta = page.waitForResponse((r) => r.url().includes('/alumnos/completo') && r.request().method() === 'POST');
  await page.getByRole('button', { name: 'Guardar Estudiante' }).click();
  const res = await respuesta;
  expect(res.status(), await res.text()).toBe(201);
  await expect(page.getByText('Estudiante creado exitosamente')).toBeVisible();

  await page.waitForURL(/\/alumnos\/\d+$/);
  const id = Number(page.url().split('/').pop());
  creados.push(id);

  const [horario] = await horariosDe(request, id);
  expect(horario.dia_semana).toBe('ROTATIVO');
  expect(horario.hora_inicio).toBeNull();
  expect(horario.detalle).toBe(PREGUNTA);
});

test('Horarios > Editar también guarda un rotativo (no manda hora_fin nula)', async ({ page, request }) => {
  const idPrograma = await programaActivoId(request);
  const alumno = await crearAlumnoCompleto(request, {
    nombre: `E2E HorEditar ${Date.now()}`,
    programas: [{ id_programa: idPrograma, frecuencia: 1, horarios: [{ dia_semana: 'ROTATIVO', detalle: PREGUNTA }] }],
  });
  creados.push(alumno.id);
  const [horario] = await horariosDe(request, alumno.id);

  await page.goto(`/horarios/${horario.id}/editar`);
  const campo = page.getByLabel('Pregunta para el estudiante');
  await expect(campo).toHaveValue(PREGUNTA);
  await campo.fill('¿Qué turnos tienes libres esta semana?');

  const respuesta = page.waitForResponse((r) => r.url().includes(`/horarios/${horario.id}`) && r.request().method() === 'PUT');
  await page.getByRole('button', { name: 'Guardar Cambios' }).click();
  const res = await respuesta;
  expect(res.status(), await res.text()).toBe(200);

  const [actualizado] = await horariosDe(request, alumno.id);
  expect(actualizado.detalle).toBe('¿Qué turnos tienes libres esta semana?');
  expect(actualizado.hora_inicio).toBeNull();
});

