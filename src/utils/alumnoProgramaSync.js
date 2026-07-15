// Reconciliación de AlumnoPrograma + Horarios al guardar el formulario de Alumno.
// El backend no ofrece un endpoint transaccional "guardar todo de una", así
// que el frontend arma la secuencia de POST/PUT/DELETE necesaria comparando
// lo que había (programasOriginal, sólo presente al editar) contra lo que
// quedó en el formulario (programasForm).
import {
  crearAlumnoPrograma,
  actualizarAlumnoPrograma,
  eliminarAlumnoPrograma,
} from '../api/alumnoProgramas';
import { crearHorario, actualizarHorario, eliminarHorario } from '../api/horarios';

function buildAlumnoProgramaPayload(idAlumno, programa) {
  return {
    id_alumno: idAlumno,
    id_programa: Number(programa.id_programa),
    id_profesor: programa.id_profesor ? Number(programa.id_profesor) : null,
    frecuencia: Number(programa.frecuencia),
    valor_clase_clp: Number(programa.valor_clase_clp),
  };
}

function buildHorarioPayload(idAlumnoPrograma, horario) {
  return {
    id_alumno_programa: idAlumnoPrograma,
    dia_semana: horario.dia_semana,
    hora_inicio: horario.hora_inicio,
    hora_fin: horario.hora_fin || undefined,
    detalle: horario.detalle || null,
  };
}

/**
 * Crea, desde cero, los AlumnoPrograma y Horarios de un alumno recién creado.
 */
export async function crearProgramasYHorarios(idAlumno, programasForm) {
  for (const programa of programasForm) {
    const res = await crearAlumnoPrograma(buildAlumnoProgramaPayload(idAlumno, programa));
    const idAlumnoPrograma = res?.data?.id;
    for (const horario of programa.horarios || []) {
      await crearHorario(buildHorarioPayload(idAlumnoPrograma, horario));
    }
  }
}

/**
 * Reconcilia los AlumnoPrograma/Horarios de un alumno existente: crea los
 * nuevos, actualiza los que cambiaron y elimina los que ya no están.
 */
export async function sincronizarProgramasYHorarios(idAlumno, programasForm, programasOriginal = []) {
  const formIds = new Set(programasForm.filter((p) => p.id).map((p) => Number(p.id)));

  // Elimina programas (y sus horarios) que el usuario quitó del formulario.
  for (const original of programasOriginal) {
    if (!formIds.has(Number(original.id))) {
      for (const horario of original.horarios || []) {
        await eliminarHorario(horario.id);
      }
      await eliminarAlumnoPrograma(original.id);
    }
  }

  for (const programa of programasForm) {
    let idAlumnoPrograma;

    if (programa.id) {
      await actualizarAlumnoPrograma(programa.id, buildAlumnoProgramaPayload(idAlumno, programa));
      idAlumnoPrograma = Number(programa.id);
    } else {
      const res = await crearAlumnoPrograma(buildAlumnoProgramaPayload(idAlumno, programa));
      idAlumnoPrograma = res?.data?.id;
    }

    const original = programasOriginal.find((p) => Number(p.id) === Number(programa.id));
    const originalHorarios = original?.horarios || [];
    const formHorarioIds = new Set((programa.horarios || []).filter((h) => h.id).map((h) => Number(h.id)));

    for (const horario of originalHorarios) {
      if (!formHorarioIds.has(Number(horario.id))) {
        await eliminarHorario(horario.id);
      }
    }

    for (const horario of programa.horarios || []) {
      if (horario.id) {
        await actualizarHorario(horario.id, buildHorarioPayload(idAlumnoPrograma, horario));
      } else {
        await crearHorario(buildHorarioPayload(idAlumnoPrograma, horario));
      }
    }
  }
}
