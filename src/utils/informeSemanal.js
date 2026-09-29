// jsPDF/exceljs son pesadas (~450kB) y solo hacen falta cuando alguien
// realmente toca un botón de descarga — se cargan con import() dinámico
// dentro de cada función en vez de aquí arriba, para no metérselas a todos
// los que abren la tabla de Estudiantes (donde vive este informe).
import { DIAS_DISPLAY, DIA_ROTATIVO } from './constants';
import { formatTime } from './formatters';

// Mismo criterio que usa el backend (ProgramacionMensajeService._alumnoCubiertoPorMasivo)
// para decidir a quién le llega el mensaje semanal — se replica acá para no
// depender de un endpoint nuevo solo para este informe.
export function alumnoCubiertoPorMasivo(alumno, config) {
  switch (config?.envio_masivo_destinatarios) {
    case 'ACTIVOS':   return !!alumno.activo;
    case 'INACTIVOS': return !alumno.activo;
    case 'TODOS':     return true;
    case 'SELECCION': return (config.envio_masivo_alumnos_ids || []).includes(alumno.id);
    default:          return false;
  }
}

// Cumplir el criterio de destinatarios no basta: si el alumno ya tenía una
// ProgramacionMensaje PENDIENTE y alguien la pausó a mano con el switch de
// Estudiantes, el barrido semanal del masivo NO la reactiva sola (ver
// _normalizarProgramacionesEnvioMasivo, `reactivarPausados` solo se usa al
// activar/editar el masivo, nunca en la corrida semanal del cron) — así que
// ese alumno queda cubierto por el masivo "en el papel" pero no recibirá el
// mensaje esta semana. Sin filtrar esto, el informe mostraba alumnos con el
// envío individual pausado como si fueran a recibirlo.
export function recibiraMensajeEstaSemana(alumno, programacionesPorAlumno) {
  const pendiente = programacionesPorAlumno?.get(String(alumno.id));
  return !pendiente || pendiente.activo;
}

export const DIA_ORDEN = ['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO', 'DOMINGO'];

/**
 * Columnas de la grilla semanal de un profesor. Los rotativos no caen en
 * ningún día, así que se les da una columna propia al final — pero solo
 * cuando ese profesor tiene alguno, para no ensuciar la grilla del resto.
 */
export function diasDeGrilla(clases) {
  return clases.some((c) => c.dia === DIA_ROTATIVO) ? [...DIA_ORDEN, DIA_ROTATIVO] : DIA_ORDEN;
}

const ROSE = [193, 122, 94];     // #C17A5E
const ROSE_LIGHT = [245, 237, 232]; // #F5EDE8
const ROSE_TEXT = [139, 94, 74];    // #8B5E4A

const nombreProfesor = (profesoresPorId, idProfesor) => {
  const p = profesoresPorId.get(idProfesor);
  return p ? `${p.nombre} ${p.apellido}`.trim() : 'Sin profesor asignado';
};

// Un rotativo no tiene hora: lo que lo describe es su pregunta (el detalle).
const rangoHorario = (h) => (
  h.dia_semana === DIA_ROTATIVO
    ? 'sin hora fija'
    : `${formatTime(h.hora_inicio)}${h.hora_fin ? ` - ${formatTime(h.hora_fin)}` : ''}`
);

/**
 * Una fila por alumno cubierto por el envío masivo, con sus horarios y
 * profesor(es) — para el informe de "a quién le llega el mensaje esta semana".
 */
export function construirFilasInforme(alumnos, profesoresPorId, config, programacionesPorAlumno) {
  return alumnos
    .filter((a) => alumnoCubiertoPorMasivo(a, config) && recibiraMensajeEstaSemana(a, programacionesPorAlumno))
    .map((a) => {
      const horarios = a.horarios || [];
      const profesores = [...new Set(horarios.map((h) => nombreProfesor(profesoresPorId, h.id_profesor)))];
      return {
        alumno: a.nombre,
        profesores: profesores.length ? profesores : ['Sin profesor asignado'],
        horarios: horarios.length
          ? horarios.map((h) => {
              const base = `${DIAS_DISPLAY[h.dia_semana] || h.dia_semana} ${rangoHorario(h)}`;
              return h.dia_semana === DIA_ROTATIVO && h.detalle ? `${base} — ${h.detalle}` : base;
            })
          : ['Sin horario cargado'],
      };
    })
    .sort((a, b) => a.alumno.localeCompare(b.alumno, 'es'));
}

/** Agrupa las clases de los alumnos cubiertos por el masivo, por profesor. */
export function agruparPorProfesor(alumnos, profesoresPorId, config, programacionesPorAlumno) {
  const mapa = new Map(); // idProfesor(or 'sin') -> { nombre, clases: [{alumno, dia, horaInicio, horaFin}] }
  for (const alumno of alumnos) {
    if (!alumnoCubiertoPorMasivo(alumno, config) || !recibiraMensajeEstaSemana(alumno, programacionesPorAlumno)) continue;
    for (const h of alumno.horarios || []) {
      const key = h.id_profesor ?? 'sin';
      if (!mapa.has(key)) {
        mapa.set(key, { nombre: nombreProfesor(profesoresPorId, h.id_profesor), clases: [] });
      }
      mapa.get(key).clases.push({ alumno: alumno.nombre, dia: h.dia_semana, hora: rangoHorario(h), horaInicio: h.hora_inicio });
    }
  }
  return mapa;
}

/** Arma la grilla semanal (una fila por bloque horario) para UN profesor. */
export function grillaSemanal(clases) {
  const dias = diasDeGrilla(clases);
  const horasUnicas = [...new Set(clases.map((c) => c.hora))].sort();
  return horasUnicas.map((hora) => {
    const fila = { hora };
    for (const dia of dias) {
      const alumnosEnBloque = clases.filter((c) => c.hora === hora && c.dia === dia).map((c) => c.alumno);
      fila[dia] = alumnosEnBloque.join('\n');
    }
    return fila;
  });
}

const encabezadoPDF = (doc, titulo, config) => {
  doc.setFillColor(...ROSE);
  doc.rect(0, 0, doc.internal.pageSize.getWidth(), 24, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.text('Sofi Rose Academy', 12, 11);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(titulo, 12, 18);
  doc.setTextColor(...ROSE_TEXT);
  doc.setFontSize(9);
  const dia = DIAS_DISPLAY[config?.envio_masivo_dia_semana] || config?.envio_masivo_dia_semana || '-';
  const hora = formatTime(config?.envio_masivo_hora);
  doc.text(`Envío masivo: ${dia} ${hora} — generado ${new Date().toLocaleDateString('es-CL')}`, 12, 32);
};

export async function descargarInformePDF(filas, config) {
  const { default: jsPDF } = await import('jspdf');
  const { default: autoTable } = await import('jspdf-autotable');
  const doc = new jsPDF();
  encabezadoPDF(doc, 'Informe de envío masivo semanal', config);
  autoTable(doc, {
    startY: 38,
    head: [['Alumno', 'Profesor(es)', 'Horario']],
    body: filas.map((f) => [f.alumno, f.profesores.join('\n'), f.horarios.join('\n')]),
    headStyles: { fillColor: ROSE, textColor: 255, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: ROSE_LIGHT },
    styles: { fontSize: 9, cellPadding: 3, valign: 'top' },
    margin: { top: 38 },
  });
  doc.save(`informe-envio-masivo-${new Date().toISOString().slice(0, 10)}.pdf`);
}

export async function descargarInformeExcel(filas, config) {
  const { default: ExcelJS } = await import('exceljs');
  const workbook = new ExcelJS.Workbook();
  const hoja = workbook.addWorksheet('Envío masivo');
  hoja.columns = [
    { header: 'Alumno', key: 'alumno', width: 30 },
    { header: 'Profesor(es)', key: 'profesores', width: 28 },
    { header: 'Horario', key: 'horarios', width: 36 },
  ];
  hoja.getRow(1).eachCell((cell) => {
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFC17A5E' } };
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    cell.alignment = { vertical: 'middle' };
  });
  filas.forEach((f, i) => {
    const row = hoja.addRow({ alumno: f.alumno, profesores: f.profesores.join('\n'), horarios: f.horarios.join('\n') });
    row.alignment = { wrapText: true, vertical: 'top' };
    if (i % 2 === 1) {
      row.eachCell((cell) => { cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF5EDE8' } }; });
    }
  });
  await descargarWorkbook(workbook, `informe-envio-masivo-${new Date().toISOString().slice(0, 10)}.xlsx`);
}

export async function descargarHorarioProfesoresPDF(mapaPorProfesor, config) {
  const { default: jsPDF } = await import('jspdf');
  const { default: autoTable } = await import('jspdf-autotable');
  const doc = new jsPDF({ orientation: 'landscape' });
  const profesores = [...mapaPorProfesor.values()];
  profesores.forEach((prof, i) => {
    if (i > 0) doc.addPage();
    encabezadoPDF(doc, `Horario semanal — ${prof.nombre}`, config);
    autoTable(doc, {
      startY: 38,
      head: [['Hora', ...diasDeGrilla(prof.clases).map((d) => DIAS_DISPLAY[d])]],
      body: grillaSemanal(prof.clases).map((fila) => [fila.hora, ...diasDeGrilla(prof.clases).map((d) => fila[d] || '')]),
      headStyles: { fillColor: ROSE, textColor: 255, fontStyle: 'bold', halign: 'center' },
      alternateRowStyles: { fillColor: ROSE_LIGHT },
      styles: { fontSize: 8, cellPadding: 2.5, valign: 'top', halign: 'center' },
      columnStyles: { 0: { fontStyle: 'bold', halign: 'center' } },
      margin: { top: 38 },
    });
  });
  if (profesores.length === 0) {
    encabezadoPDF(doc, 'Horario semanal por profesor', config);
    doc.setTextColor(0, 0, 0);
    doc.text('No hay clases para el grupo cubierto por el envío masivo.', 12, 45);
  }
  doc.save(`horario-por-profesor-${new Date().toISOString().slice(0, 10)}.pdf`);
}

export async function descargarHorarioProfesoresExcel(mapaPorProfesor, config) {
  const { default: ExcelJS } = await import('exceljs');
  const workbook = new ExcelJS.Workbook();
  for (const prof of mapaPorProfesor.values()) {
    const nombreHoja = prof.nombre.slice(0, 31) || 'Profesor'; // límite de Excel para nombres de hoja
    const hoja = workbook.addWorksheet(nombreHoja);
    hoja.columns = [
      { header: 'Hora', key: 'hora', width: 14 },
      ...diasDeGrilla(prof.clases).map((d) => ({ header: DIAS_DISPLAY[d], key: d, width: 22 })),
    ];
    hoja.getRow(1).eachCell((cell) => {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFC17A5E' } };
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
    });
    grillaSemanal(prof.clases).forEach((fila, i) => {
      const row = hoja.addRow(fila);
      row.alignment = { wrapText: true, vertical: 'top', horizontal: 'center' };
      row.getCell('hora').font = { bold: true };
      if (i % 2 === 1) {
        row.eachCell((cell) => { cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF5EDE8' } }; });
      }
    });
  }
  if (mapaPorProfesor.size === 0) {
    workbook.addWorksheet('Horario').addRow(['No hay clases para el grupo cubierto por el envío masivo.']);
  }
  await descargarWorkbook(workbook, `horario-por-profesor-${new Date().toISOString().slice(0, 10)}.xlsx`);
}

async function descargarWorkbook(workbook, nombreArchivo) {
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = URL.createObjectURL(blob);
  const enlace = document.createElement('a');
  enlace.href = url;
  enlace.download = nombreArchivo;
  document.body.appendChild(enlace);
  enlace.click();
  document.body.removeChild(enlace);
  URL.revokeObjectURL(url);
}
