import { test, expect } from '@playwright/test';
import { crearAlumnoCompleto, eliminarAlumno } from './api-helpers.js';

// El día "Rotativo" (el octavo del selector) es para alumnos con turnos
// rotativos: no tiene hora, y su Detalle es la pregunta que se le manda al
// alumno por WhatsApp para que él confirme cuándo puede esa semana.
const PREGUNTA = '¿Qué días puedes esta semana?';

let alumnoConRotativo;

test.beforeAll(async ({ request }) => {
  const respuesta = await request.get('http://localhost:3000/api/programas?activo=true&limit=1');
  const idPrograma = (await respuesta.json()).data?.[0]?.id;

  alumnoConRotativo = await crearAlumnoCompleto(request, {
    nombre: `E2E Rotativo ${Date.now()}`,
    programas: [{
      id_programa: idPrograma,
      frecuencia: 2,
      horarios: [
        { dia_semana: 'MARTES', hora_inicio: '10:00', hora_fin: '11:00' },
        { dia_semana: 'ROTATIVO', detalle: PREGUNTA },
      ],
    }],
  });
});

test.afterAll(async ({ request }) => {
  if (alumnoConRotativo) await eliminarAlumno(request, alumnoConRotativo.id);
});

test('el selector de día del formulario ofrece "Rotativo" como octava opción', async ({ page }) => {
  await page.goto('/horarios/nuevo');
  const selectorDia = page.locator('select').filter({ has: page.locator('option[value="ROTATIVO"]') });
  await expect(selectorDia).toHaveCount(1);
  await expect(selectorDia.locator('option')).toHaveCount(8 + 1); // 7 días + Rotativo + el placeholder
});

test('al elegir "Rotativo" desaparece la hora y el Detalle pasa a ser la pregunta', async ({ page }) => {
  await page.goto('/horarios/nuevo');

  await expect(page.getByLabel('Hora de Inicio')).toBeVisible();
  await expect(page.getByLabel('Detalle')).toBeVisible();

  await page.locator('select').filter({ has: page.locator('option[value="ROTATIVO"]') }).selectOption('ROTATIVO');

  await expect(page.getByLabel('Hora de Inicio')).toHaveCount(0);
  await expect(page.getByLabel('Hora de Fin')).toHaveCount(0);
  await expect(page.getByLabel('Pregunta para el estudiante')).toBeVisible();
});

test('la tabla de Estudiantes muestra el rotativo sin hora, con su pregunta', async ({ page }) => {
  await page.goto('/alumnos');
  await page.getByPlaceholder('Buscar estudiante por nombre o correo...').fill(alumnoConRotativo.nombre);

  const fila = page.getByRole('row').filter({ hasText: alumnoConRotativo.nombre });
  await expect(fila).toBeVisible();

  // El chip del rotativo lleva la pregunta (el separador "·" va pegado al
  // texto: la separación visual la da el margen CSS) y NO lleva hora.
  const chipRotativo = fila.getByTitle(PREGUNTA);
  await expect(chipRotativo).toBeVisible();
  await expect(chipRotativo).toContainText('Rot.');
  await expect(chipRotativo).toContainText(PREGUNTA);
  await expect(chipRotativo).not.toContainText(':'); // ninguna hora

  // El horario fijo del mismo alumno sí muestra su hora.
  await expect(fila.getByText('Mar 10:00')).toBeVisible();
});

test('el calendario semanal por profesor sigue cargando con el día nuevo', async ({ page }) => {
  await page.goto('/horarios/semana');
  // El aparte de "Rotativos" vive dentro de la vista de un profesor concreto;
  // acá se comprueba que la página no se rompió al agregar el día 8.
  await expect(page.getByText('Horario Semanal por Profesor')).toBeVisible();
  await expect(page.getByText('Selecciona un profesor para ver su horario semanal')).toBeVisible();
});
