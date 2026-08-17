/** Helpers para crear/limpiar datos de prueba directo contra la API del
 * backend local (bypasea la UI para el setup, más rápido y menos frágil).
 * Reutiliza la sesión guardada en e2e/.auth/admin.json (misma cookie httpOnly). */
const API_URL = 'http://localhost:3000/api';

// El envío masivo (si está activo en la configuración) sólo asegura la
// próxima ProgramacionMensaje a alumnos con al menos un AlumnoPrograma
// activo — un alumno sin ningún programa queda fuera aunque tenga día de
// envío configurado. Por eso, salvo que el test pida explícitamente
// `programas: []`, se le asigna uno real para que siempre le quede una
// programación de WhatsApp pendiente, sin importar si el masivo está
// activo o no en el entorno donde corran los tests.
async function primerProgramaActivoId(request) {
  const respuesta = await request.get(`${API_URL}/programas?activo=true&limit=1`);
  const body = await respuesta.json();
  return body.data?.[0]?.id ?? null;
}

export async function crearAlumnoCompleto(request, overrides = {}) {
  const nombre = overrides.nombre || `E2E Alumno ${Date.now()}`;
  const programas = overrides.programas !== undefined
    ? overrides.programas
    : await (async () => {
        const idPrograma = await primerProgramaActivoId(request);
        return idPrograma ? [{ id_programa: idPrograma, frecuencia: 1, horarios: [] }] : [];
      })();

  const respuesta = await request.post(`${API_URL}/alumnos/completo`, {
    data: {
      nombre,
      telefono:      '+56912345678',
      email:         `${nombre.replace(/\s+/g, '').toLowerCase()}@e2e.test`,
      fecha_ingreso: '2026-01-01',
      dia_envio_mensaje:  'LUNES',
      hora_envio_mensaje: '09:00',
      usar_alias_mensaje: true,
      ...overrides,
      programas,
    },
  });
  if (!respuesta.ok()) {
    throw new Error(`No se pudo crear el alumno de prueba: ${respuesta.status()} ${await respuesta.text()}`);
  }
  const body = await respuesta.json();
  return body.data;
}

export async function eliminarAlumno(request, id) {
  await request.delete(`${API_URL}/alumnos/${id}`);
}
