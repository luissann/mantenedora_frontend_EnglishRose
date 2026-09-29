import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Edit, Trash2, Plus, Send, Pin, PinOff, FileText, FileSpreadsheet, ClipboardList, Star } from 'lucide-react';
import { PageHeader } from '../../components/shared/PageHeader';
import { Button } from '../../components/ui/Button';
import { SearchBar } from '../../components/ui/SearchBar';
import { Select } from '../../components/ui/Select';
import { Table } from '../../components/ui/Table';
import { Pagination } from '../../components/ui/Pagination';
import { Toggle } from '../../components/ui/Toggle';
import { Modal } from '../../components/ui/Modal';
import { EmptyState } from '../../components/shared/EmptyState';
import { ConfirmDialog } from '../../components/shared/ConfirmDialog';
import { DiaSemanaCalendarPicker } from '../../components/shared/DiaSemanaCalendarPicker';
import { Spinner } from '../../components/ui/Spinner';
import { useAlumnos, useEliminarAlumno, useActualizarAlumno } from '../../hooks/useAlumnos';
import { useProgramas } from '../../hooks/useProgramas';
import { useProfesores } from '../../hooks/useProfesores';
import {
  useProgramacionMensajes,
  useActualizarProgramacionMensaje,
  useCrearProgramacionMensaje,
} from '../../hooks/useProgramacionMensajes';
import { useConfiguracionSistema, useActualizarConfiguracionSistema } from '../../hooks/useConfiguracionSistema';
import { formatDate, formatTime } from '../../utils/formatters';
import { DIAS_DISPLAY, DIAS_CORTO, DIA_ROTATIVO, ESTADO_BADGE } from '../../utils/constants';
import {
  construirFilasInforme,
  agruparPorProfesor,
  grillaSemanal,
  diasDeGrilla,
  descargarInformePDF,
  descargarInformeExcel,
  descargarHorarioProfesoresPDF,
  descargarHorarioProfesoresExcel,
} from '../../utils/informeSemanal';


function ReprogramarForm({ idAlumno, onDone, onCancel }) {
  const crearMutation = useCrearProgramacionMensaje();
  const [fecha, setFecha] = useState('');
  const [hora, setHora] = useState('09:00');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!fecha) return;
    crearMutation.mutate(
      { id_alumno: idAlumno, fecha_envio: fecha, hora_envio: hora, activo: true },
      { onSuccess: onDone }
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-1">
      <div className="flex gap-1">
        <input
          type="date"
          value={fecha}
          min={new Date().toISOString().split('T')[0]}
          onChange={(e) => setFecha(e.target.value)}
          className="w-32 rounded-lg border border-border-input bg-white px-1.5 py-1 text-xs outline-none focus:border-rose"
        />
        <input
          type="time"
          value={hora}
          onChange={(e) => setHora(e.target.value)}
          className="w-20 rounded-lg border border-border-input bg-white px-1.5 py-1 text-xs outline-none focus:border-rose"
        />
      </div>
      <div className="flex items-center gap-2">
        <button
          type="submit"
          disabled={!fecha || crearMutation.isPending}
          className="rounded-lg bg-rose px-2 py-1 text-xs font-medium text-white disabled:opacity-50"
        >
          Programar envío
        </button>
        <button type="button" onClick={onCancel} className="text-xs text-text-secondary hover:underline">
          Cancelar
        </button>
      </div>
    </form>
  );
}

function EnvioSwitchCell({ idAlumno, programacion }) {
  const actualizarMutation = useActualizarProgramacionMensaje();
  const [configurando, setConfigurando] = useState(false);

  if (!programacion) {
    if (configurando) {
      return (
        <div onClick={(e) => e.stopPropagation()}>
          <ReprogramarForm
            idAlumno={idAlumno}
            onDone={() => setConfigurando(false)}
            onCancel={() => setConfigurando(false)}
          />
        </div>
      );
    }
    return (
      <div className="space-y-1" onClick={(e) => e.stopPropagation()}>
        <Toggle
          value={false}
          trueLabel="Enviar"
          falseLabel="Pausado"
          onChange={(value) => value && setConfigurando(true)}
        />
        <p className="text-[11px] text-text-secondary">Sin envío programado</p>
      </div>
    );
  }

  return (
    <div className="space-y-1" onClick={(e) => e.stopPropagation()}>
      <Toggle
        value={!!programacion.activo}
        trueLabel="Enviar"
        falseLabel="Pausado"
        onChange={(value) => actualizarMutation.mutate({ id: programacion.id, activo: value })}
      />
      {programacion.activo && (
        <p className="text-[11px] text-text-secondary">
          Próximo: {formatDate(programacion.fecha_envio)} {formatTime(programacion.hora_envio)}
        </p>
      )}
    </div>
  );
}

function InformeSemanalModal({ proximaProgramacionPorAlumno }) {
  const [abierto, setAbierto] = useState(false);
  const [generando, setGenerando] = useState(null);
  const [profesorSeleccionado, setProfesorSeleccionado] = useState('');

  const { data: configData } = useConfiguracionSistema();
  const { data: alumnosData, isLoading: cargandoAlumnos } = useAlumnos({ limit: 1000 }, { enabled: abierto });
  const { data: profesoresData, isLoading: cargandoProfesores } = useProfesores({ limit: 200 }, { enabled: abierto });

  const config = configData?.data;
  const alumnosTodos = alumnosData?.data || [];
  const profesoresPorId = useMemo(() => {
    const mapa = new Map();
    for (const p of profesoresData?.data || []) mapa.set(p.id, p);
    return mapa;
  }, [profesoresData]);

  const filas = useMemo(
    () => construirFilasInforme(alumnosTodos, profesoresPorId, config, proximaProgramacionPorAlumno),
    [alumnosTodos, profesoresPorId, config, proximaProgramacionPorAlumno]
  );
  const porProfesor = useMemo(
    () => agruparPorProfesor(alumnosTodos, profesoresPorId, config, proximaProgramacionPorAlumno),
    [alumnosTodos, profesoresPorId, config, proximaProgramacionPorAlumno]
  );
  const listaProfesores = useMemo(() => [...porProfesor.entries()], [porProfesor]);

  const profesorActivo = listaProfesores.find(([key]) => String(key) === profesorSeleccionado) || listaProfesores[0];
  const cargando = cargandoAlumnos || cargandoProfesores;

  const ejecutar = async (clave, fn) => {
    setGenerando(clave);
    try {
      await fn();
    } finally {
      setGenerando(null);
    }
  };

  return (
    <>
      <Button type="button" variant="secondary" leftIcon={<ClipboardList className="h-4 w-4" />} onClick={() => setAbierto(true)}>
        Informe semanal
      </Button>

      <Modal isOpen={abierto} onClose={() => setAbierto(false)} title="Informe del envío masivo semanal" size="lg">
        <div className="max-h-[70vh] space-y-6 overflow-y-auto pr-1">
          <p className="text-sm text-text-secondary">
            {cargando
              ? 'Cargando...'
              : config?.envio_masivo_activo
              ? `Cubre a ${filas.length} estudiante(s) que recibirán el mensaje de ${DIAS_DISPLAY[config.envio_masivo_dia_semana] || config.envio_masivo_dia_semana} ${formatTime(config.envio_masivo_hora)}.`
              : 'El envío masivo está desactivado — igual se muestra a quién le tocaría según la configuración guardada.'}
          </p>

          <div>
            <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
              <h3 className="font-semibold">Alumno, profesor y horario</h3>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  disabled={cargando || filas.length === 0}
                  loading={generando === 'informe-pdf'}
                  onClick={() => ejecutar('informe-pdf', () => descargarInformePDF(filas, config))}
                >
                  <FileText className="mr-1.5 h-4 w-4" /> PDF
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  disabled={cargando || filas.length === 0}
                  loading={generando === 'informe-excel'}
                  onClick={() => ejecutar('informe-excel', () => descargarInformeExcel(filas, config))}
                >
                  <FileSpreadsheet className="mr-1.5 h-4 w-4" /> Excel
                </Button>
              </div>
            </div>
            {filas.length === 0 && !cargando ? (
              <p className="text-sm text-text-secondary">Nadie está cubierto por el envío masivo en este momento.</p>
            ) : (
              <div className="max-h-64 overflow-y-auto rounded-2xl border border-border-input">
                <table className="w-full text-left text-sm">
                  <thead className="sticky top-0 bg-rose-light">
                    <tr>
                      <th className="px-3 py-2 font-semibold">Alumno</th>
                      <th className="px-3 py-2 font-semibold">Profesor(es)</th>
                      <th className="px-3 py-2 font-semibold">Horario</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filas.map((f) => (
                      <tr key={f.alumno} className="border-t border-border-input">
                        <td className="px-3 py-2">{f.alumno}</td>
                        <td className="px-3 py-2">{f.profesores.join(', ')}</td>
                        <td className="px-3 py-2 whitespace-pre-line">{f.horarios.join('\n')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div>
            <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
              <h3 className="font-semibold">Horario semanal por profesor</h3>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  disabled={cargando || porProfesor.size === 0}
                  loading={generando === 'horario-pdf'}
                  onClick={() => ejecutar('horario-pdf', () => descargarHorarioProfesoresPDF(porProfesor, config))}
                >
                  <FileText className="mr-1.5 h-4 w-4" /> PDF (todos)
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  disabled={cargando || porProfesor.size === 0}
                  loading={generando === 'horario-excel'}
                  onClick={() => ejecutar('horario-excel', () => descargarHorarioProfesoresExcel(porProfesor, config))}
                >
                  <FileSpreadsheet className="mr-1.5 h-4 w-4" /> Excel (todos)
                </Button>
              </div>
            </div>

            {listaProfesores.length === 0 && !cargando ? (
              <p className="text-sm text-text-secondary">No hay clases para el grupo cubierto por el envío masivo.</p>
            ) : (
              <>
                <Select
                  options={listaProfesores.map(([key, prof]) => ({ value: String(key), label: prof.nombre }))}
                  value={profesorActivo ? String(profesorActivo[0]) : ''}
                  onChange={setProfesorSeleccionado}
                  placeholder="Elegir profesor para previsualizar"
                />
                {profesorActivo && (
                  <div className="mt-3 max-h-64 overflow-auto rounded-2xl border border-border-input">
                    <table className="w-full text-center text-xs">
                      <thead className="sticky top-0 bg-rose-light">
                        <tr>
                          <th className="px-2 py-2 text-left font-semibold">Hora</th>
                          {diasDeGrilla(profesorActivo[1].clases).map((d) => (
                            <th key={d} className="px-2 py-2 font-semibold">{DIAS_DISPLAY[d]}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {grillaSemanal(profesorActivo[1].clases).map((fila) => (
                          <tr key={fila.hora} className="border-t border-border-input">
                            <td className="px-2 py-2 text-left font-medium">{fila.hora}</td>
                            {diasDeGrilla(profesorActivo[1].clases).map((d) => (
                              <td key={d} className="whitespace-pre-line px-2 py-2">{fila[d] || ''}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </Modal>
    </>
  );
}

function EnvioMasivoButton({ seleccionados, alumnosVisibles, onEnviado }) {
  const navigate = useNavigate();
  const { data: configData } = useConfiguracionSistema();
  const actualizarMutation = useActualizarConfiguracionSistema();
  const [modalOpen, setModalOpen] = useState(false);
  const [diaSemana, setDiaSemana] = useState('DOMINGO');
  const [hora, setHora] = useState('20:00');
  const [destinatarios, setDestinatarios] = useState('ACTIVOS');

  const config = configData?.data;
  const activo = !!config?.envio_masivo_activo;

  // Alumnos que quedarían incluidos en el envío masivo según lo seleccionado
  // en el modal, para avisar si alguno no tiene horario cargado (su mensaje
  // saldría sin horario) antes de programar el envío.
  const activoParaDestinatarios = destinatarios === 'ACTIVOS' ? 'true' : destinatarios === 'INACTIVOS' ? 'false' : '';
  const { data: alumnosParaMasivo } = useAlumnos(
    { activo: activoParaDestinatarios, limit: 1000 },
    { enabled: modalOpen && destinatarios !== 'SELECCION' }
  );
  // Para SELECCION no hay un endpoint que traiga solo esos ids: se aprovecha
  // la info que la tabla de Estudiantes ya cargó de los alumnos visibles.
  // Si hay seleccionados de otra página que no está cargada ahora mismo, no
  // se les valida el horario acá (limitación conocida, no bloquea el envío).
  const alumnosSinHorario = destinatarios === 'SELECCION'
    ? alumnosVisibles.filter((a) => seleccionados.has(a.id) && (a.horarios || []).length === 0)
    : (alumnosParaMasivo?.data || []).filter((a) => (a.horarios || []).length === 0);

  // Se inicializa al abrir el modal (acción explícita del usuario, no un
  // efecto reactivo) para no pisar en silencio lo que la dueña ya eligió si
  // config se refetchea en segundo plano mientras el modal sigue abierto.
  // Si ya hay estudiantes tildados en la tabla, parte directo en "Solo los
  // seleccionados" — si no, era fácil dejar el destinatario guardado la
  // última vez (ACTIVOS, etc.) sin querer y terminar mandando a todos por
  // no haber tocado el desplegable a propósito.
  const abrirModal = () => {
    if (config) {
      setDiaSemana(config.envio_masivo_dia_semana || 'DOMINGO');
      setHora((config.envio_masivo_hora || '20:00:00').slice(0, 5));
    }
    setDestinatarios(seleccionados.size > 0 ? 'SELECCION' : (config?.envio_masivo_destinatarios || 'ACTIVOS'));
    setModalOpen(true);
  };

  // El switch usa siempre el día/hora/destinatarios ya guardado (o el
  // default si nunca se configuró); para cambiarlos está el modal, que
  // además activa.
  const alternar = (nuevoActivo) => {
    actualizarMutation.mutate({
      envio_masivo_activo:        nuevoActivo,
      envio_masivo_dia_semana:    config?.envio_masivo_dia_semana || diaSemana,
      envio_masivo_hora:          (config?.envio_masivo_hora || hora).slice(0, 5),
      envio_masivo_destinatarios: config?.envio_masivo_destinatarios || destinatarios,
      envio_masivo_alumnos_ids:   config?.envio_masivo_alumnos_ids ?? [...seleccionados],
    });
  };

  const guardarYActivar = () => {
    actualizarMutation.mutate(
      {
        envio_masivo_activo:        true,
        envio_masivo_dia_semana:    diaSemana,
        envio_masivo_hora:          hora,
        envio_masivo_destinatarios: destinatarios,
        envio_masivo_alumnos_ids:   destinatarios === 'SELECCION' ? [...seleccionados] : undefined,
      },
      { onSuccess: () => { setModalOpen(false); onEnviado?.(); } }
    );
  };

  return (
    <>
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2.5 rounded-full border border-border-input bg-white py-1.5 pl-4 pr-1.5">
          <span className="text-xs font-medium text-text-secondary">Envío masivo</span>
          <div className="flex rounded-full bg-rose-light p-0.5">
            {[{ v: true, label: 'Activado' }, { v: false, label: 'Pausado' }].map((opt) => (
              <button
                key={String(opt.v)}
                type="button"
                onClick={() => activo !== opt.v && alternar(opt.v)}
                className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                  activo === opt.v ? 'bg-white text-rose shadow-sm' : 'text-text-secondary'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={abrirModal}
            aria-label="Configurar envío masivo"
            className="flex items-center gap-1 rounded-full px-2.5 py-1.5 text-xs font-semibold text-rose-text hover:bg-rose-light"
          >
            <Send className="h-3.5 w-3.5" />
            {config
              ? `${DIAS_CORTO[config.envio_masivo_dia_semana] || config.envio_masivo_dia_semana} ${String(config.envio_masivo_hora || '').slice(0, 5)}`
              : 'Configurar'}
          </button>
        </div>
        {/* Recordatorio visible sin abrir el modal: el switch no es un envío
            puntual de la semana, sigue disparando solo cada semana hasta que
            alguien lo apague a mano — se agregó tras un envío real que salió
            un domingo en que la dueña creía tener todo desactivado, porque
            nadie había vuelto a tocar el switch desde la semana anterior. */}
        {activo && config && (
          <p className="px-1 text-xs text-text-secondary">
            Se repite cada {DIAS_DISPLAY[config.envio_masivo_dia_semana] || config.envio_masivo_dia_semana} a las{' '}
            {String(config.envio_masivo_hora || '').slice(0, 5)}, automáticamente, hasta que lo apagues.
          </p>
        )}
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Envío masivo automático" size="sm">
        <div className="space-y-4">
          <p className="text-sm text-text-secondary">
            El día y la hora que elijas aquí tienen prioridad sobre cualquier envío
            individual que un estudiante ya tuviera agendado: al activarlo (o al guardar un
            cambio de horario), todos los estudiantes activos quedan reagendados exactamente
            a esa fecha y hora. <strong>Se repite cada semana hasta que lo desactives con el
            switch</strong> — que se haya enviado un mensaje no lo apaga. Si lo desactivas,
            cualquier envío que ya estuviera en cola para este ciclo se cancela de inmediato
            y no se manda.
          </p>
          <DiaSemanaCalendarPicker label="Día de la semana" diaSemana={diaSemana} onChange={setDiaSemana} />
          <div>
            <label className="text-sm text-text-secondary">Hora</label>
            <input
              type="time"
              value={hora}
              onChange={(e) => setHora(e.target.value)}
              className="mt-2 w-full rounded-2xl border border-border-input bg-white px-4 py-3 text-sm outline-none focus:border-rose focus:ring-2 focus:ring-rose/20"
            />
          </div>
          <div>
            <label className="text-sm text-text-secondary">Enviar a</label>
            <Select
              options={[
                { value: 'ACTIVOS', label: 'Solo estudiantes activos' },
                { value: 'INACTIVOS', label: 'Solo estudiantes inactivos' },
                { value: 'TODOS', label: 'Todos (activos e inactivos)' },
                { value: 'SELECCION', label: `Solo los seleccionados con casillas (${seleccionados.size})` },
              ]}
              value={destinatarios}
              onChange={setDestinatarios}
            />
            {destinatarios === 'SELECCION' && seleccionados.size === 0 && (
              <p className="mt-2 text-xs text-amber-700">
                No hay ningún estudiante tildado en la tabla todavía. Cierra este modal, marca las casillas que quieras y vuelve a abrirlo.
              </p>
            )}
          </div>
          {alumnosSinHorario.length > 0 && (
            <div className="rounded-2xl border border-amber-300 bg-amber-50 p-3 text-xs text-amber-800">
              <p className="font-semibold">
                {alumnosSinHorario.length === 1
                  ? '1 estudiante quedará incluido sin horario cargado:'
                  : `${alumnosSinHorario.length} estudiantes quedarán incluidos sin horario cargado:`}
              </p>
              <p className="mt-1">
                Su mensaje de WhatsApp saldrá sin el bloque de horario. Revísalos o asígnales un horario antes de programar el envío:
              </p>
              <ul className="mt-2 max-h-28 list-disc space-y-0.5 overflow-y-auto pl-4">
                {alumnosSinHorario.map((a) => (
                  <li key={a.id}>
                    <button type="button" className="underline hover:no-underline" onClick={() => navigate(`/alumnos/${a.id}/editar`)}>
                      {a.nombre}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <div className="flex justify-end">
            <Button
              variant="primary"
              onClick={guardarYActivar}
              loading={actualizarMutation.isPending}
              disabled={destinatarios === 'SELECCION' && seleccionados.size === 0}
            >
              Guardar y activar
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}

export default function AlumnosPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(100);
  const [programaFilter, setProgramaFilter] = useState('');
  const [profesorFilter, setProfesorFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('true');
  const [deleteId, setDeleteId] = useState(null);
  // Selección con casillas para el envío masivo por "seleccionados" — se
  // mantiene por id, así que sobrevive a cambios de página/filtro (puedes
  // tildar en la página 1, cambiar de página y seguir sumando en la 2).
  const [seleccionados, setSeleccionados] = useState(new Set());

  const { data: alumnosData, isLoading } = useAlumnos({
    nombre: search,
    id_programa: programaFilter,
    id_profesor: profesorFilter,
    activo: statusFilter,
    page,
    limit,
  });

  const { data: programasData } = useProgramas({ activo: 'true', limit: 100 });
  const { data: profesoresData } = useProfesores({ activo: 'true', limit: 100 });
  const deleteMutation = useEliminarAlumno();
  const actualizarMutation = useActualizarAlumno();

  // El endpoint GET /alumnos no incluye la próxima programación de WhatsApp
  // pendiente, así que se resuelve en el frontend con una consulta aparte a
  // /programacion filtrando por estado PENDIENTE y agrupando por alumno.
  const { data: programacionesData } = useProgramacionMensajes({ estado_envio: 'PENDIENTE', limit: 1000 });

  const proximaProgramacionPorAlumno = useMemo(() => {
    const mapa = new Map();
    for (const row of programacionesData?.data || []) {
      if (row.estado_envio !== 'PENDIENTE') continue;
      const key = String(row.id_alumno);
      const actual = mapa.get(key);
      if (!actual) {
        mapa.set(key, row);
        continue;
      }
      // Preferir una fila activa por sobre una pausada aunque tenga fecha
      // más antigua (solo la activa es la que realmente se va a enviar).
      if (actual.activo !== row.activo) {
        if (row.activo) mapa.set(key, row);
        continue;
      }
      if (row.activo) {
        const clave = `${row.fecha_envio}${row.hora_envio}`;
        const claveActual = `${actual.fecha_envio}${actual.hora_envio}`;
        if (clave < claveActual) mapa.set(key, row);
      } else if (new Date(row.updated_at || 0) > new Date(actual.updated_at || 0)) {
        // Entre varias pausadas (debris viejo), la más reciente en tocarse
        // gana en vez de la de fecha más antigua.
        mapa.set(key, row);
      }
    }
    return mapa;
  }, [programacionesData]);

  const alumnos = alumnosData?.data || [];
  const pagination = alumnosData?.pagination || {};

  const programas = [
    { value: '', label: 'Todos los programas' },
    ...(programasData?.data || []).map((p) => ({
      value: p.id,
      label: p.nombre,
    })),
  ];

  const profesores = [
    { value: '', label: 'Todos los docentes' },
    ...(profesoresData?.data || []).map((p) => ({
      value: p.id,
      label: `${p.nombre} ${p.apellido}`,
    })),
  ];

  const toggleSeleccionado = (id) => {
    setSeleccionados((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const todosEnPaginaSeleccionados = alumnos.length > 0 && alumnos.every((a) => seleccionados.has(a.id));
  const toggleTodosEnPagina = () => {
    setSeleccionados((prev) => {
      const next = new Set(prev);
      if (todosEnPaginaSeleccionados) alumnos.forEach((a) => next.delete(a.id));
      else alumnos.forEach((a) => next.add(a.id));
      return next;
    });
  };

  const columns = [
    {
      key: 'seleccion',
      label: (
        <input
          type="checkbox"
          checked={todosEnPaginaSeleccionados}
          onChange={toggleTodosEnPagina}
          title="Seleccionar todos los de esta página"
          className="h-4 w-4 rounded border-border-input text-rose focus:ring-rose"
        />
      ),
      render: (row) => (
        <input
          type="checkbox"
          checked={seleccionados.has(row.id)}
          onChange={(e) => { e.stopPropagation(); toggleSeleccionado(row.id); }}
          onClick={(e) => e.stopPropagation()}
          className="h-4 w-4 rounded border-border-input text-rose focus:ring-rose"
        />
      ),
    },
    {
      key: 'nombre',
      label: 'Estudiante',
      render: (row) => {
        const estado = row.activo ? ESTADO_BADGE.Active : ESTADO_BADGE.Inactive;
        return (
          <div className="flex items-center gap-3">
            <div
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white ${
                row.fijado ? 'bg-rose' : 'bg-rose-glow'
              }`}
            >
              {row.nombre?.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-1.5 text-sm font-semibold text-text-primary">
                {row.nombre}
                {row.fijado && <Star className="h-3.5 w-3.5 fill-rose text-rose" />}
              </div>
              <span className={`mt-0.5 inline-block rounded-full px-2 py-0.5 text-[10.5px] font-semibold ${estado.className}`}>
                {estado.label}
              </span>
            </div>
          </div>
        );
      },
    },
    {
      key: 'horario',
      label: 'Horario',
      render: (row) => {
        const horarios = row.horarios || [];
        if (horarios.length === 0) return <span className="text-sm text-text-muted">Sin horario</span>;
        return (
          <div className="flex flex-wrap gap-1.5">
            {horarios.map((h) => {
              // Un rotativo no tiene hora que mostrar: su detalle es la
              // pregunta que se le manda al alumno, así que va en su lugar.
              const rotativo = h.dia_semana === DIA_ROTATIVO;
              return (
                <span
                  key={h.id}
                  title={h.detalle || undefined}
                  className={`rounded-full px-3 py-1 text-[11.5px] font-semibold ${
                    rotativo ? 'bg-amber-100 text-amber-800' : 'bg-rose-light text-rose-text'
                  }`}
                >
                  {DIAS_CORTO[h.dia_semana] || h.dia_semana}
                  {!rotativo && ` ${formatTime(h.hora_inicio)}`}
                  {h.detalle && (
                    <span className={`ml-1 font-normal ${rotativo ? 'text-amber-800/70' : 'text-rose-text/70'}`}>
                      · {h.detalle}
                    </span>
                  )}
                </span>
              );
            })}
          </div>
        );
      },
    },
    {
      key: 'envio_whatsapp',
      label: 'Envío WhatsApp',
      render: (row) => (
        <EnvioSwitchCell idAlumno={row.id} programacion={proximaProgramacionPorAlumno.get(String(row.id))} />
      ),
    },
    {
      key: 'actions',
      label: 'Acciones',
      render: (row) => (
        <div className="flex justify-end gap-0.5">
          <button
            onClick={(e) => { e.stopPropagation(); actualizarMutation.mutate({ id: row.id, fijado: !row.fijado }); }}
            title={row.fijado ? 'Quitar de fijados' : 'Fijar arriba de la lista'}
            className={`flex h-9 w-9 items-center justify-center rounded-full hover:bg-rose-light ${row.fijado ? 'text-rose' : 'text-text-muted'}`}
          >
            {row.fijado ? <Pin className="h-4 w-4 fill-current" /> : <PinOff className="h-4 w-4" />}
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); navigate(`/alumnos/${row.id}`); }}
            className="flex h-9 w-9 items-center justify-center rounded-full text-text-secondary hover:bg-rose-light hover:text-rose"
          >
            <Eye className="h-4 w-4" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); navigate(`/alumnos/${row.id}/editar`); }}
            className="flex h-9 w-9 items-center justify-center rounded-full text-text-secondary hover:bg-rose-light hover:text-rose"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); setDeleteId(row.id); }}
            className="flex h-9 w-9 items-center justify-center rounded-full text-text-secondary hover:bg-red-50 hover:text-red-600"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Estudiantes" />
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-border bg-white p-3.5">
          <Button variant="primary" leftIcon={<Plus className="h-4 w-4" />} onClick={() => navigate('/alumnos/nuevo')}>
            Nuevo Estudiante
          </Button>
          <div className="flex flex-wrap items-center gap-3">
            <EnvioMasivoButton
              seleccionados={seleccionados}
              alumnosVisibles={alumnos}
              onEnviado={() => setSeleccionados(new Set())}
            />
            <InformeSemanalModal proximaProgramacionPorAlumno={proximaProgramacionPorAlumno} />
          </div>
        </div>

        <div className="grid gap-3 rounded-3xl border border-border bg-white p-3.5 md:grid-cols-5">
          <div className="md:col-span-2">
            <SearchBar value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar estudiante por nombre o correo..." />
          </div>
          <Select
            options={programas}
            value={programaFilter}
            onChange={setProgramaFilter}
            placeholder="Filtrar por programa"
            searchable
          />
          <Select
            options={profesores}
            value={profesorFilter}
            onChange={setProfesorFilter}
            placeholder="Filtrar por docente"
            searchable
          />
          <Select
            options={[
              { value: '', label: 'Todos' },
              { value: 'true', label: 'Activo' },
              { value: 'false', label: 'Inactivo' },
            ]}
            value={statusFilter}
            onChange={setStatusFilter}
            placeholder="Filtrar por estado"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex h-80 items-center justify-center">
          <Spinner size="lg" />
        </div>
      ) : alumnos.length === 0 ? (
        <EmptyState title="No se encontraron estudiantes" actionLabel="Crear Estudiante" onAction={() => navigate('/alumnos/nuevo')} />
      ) : (
        <>
          <Table
            columns={columns}
            data={alumnos}
            onRowClick={(row) => navigate(`/alumnos/${row.id}`)}
            rowClassName={(row) => (row.fijado ? 'bg-rose-light/35' : '')}
          />
          <Pagination pagination={pagination} onPageChange={setPage} onLimitChange={setLimit} />
        </>
      )}

      <ConfirmDialog
        isOpen={!!deleteId}
        title="Eliminar Estudiante"
        message="¿Estás seguro de que deseas eliminar este estudiante? Esta acción no se puede deshacer."
        onConfirm={() => {
          deleteMutation.mutate(deleteId);
          setDeleteId(null);
        }}
        onCancel={() => setDeleteId(null)}
        loading={deleteMutation.isPending}
      />
    </div>
  );
}
