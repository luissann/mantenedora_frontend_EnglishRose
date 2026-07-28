import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Edit, Trash2, Plus, Send } from 'lucide-react';
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
import { useAlumnos, useEliminarAlumno } from '../../hooks/useAlumnos';
import { useProgramas } from '../../hooks/useProgramas';
import {
  useProgramacionMensajes,
  useActualizarProgramacionMensaje,
  useCrearProgramacionMensaje,
} from '../../hooks/useProgramacionMensajes';
import { useConfiguracionSistema, useActualizarConfiguracionSistema } from '../../hooks/useConfiguracionSistema';
import { formatDate, formatTime } from '../../utils/formatters';
import { DIAS_DISPLAY } from '../../utils/constants';


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
      <p className="text-[11px] text-text-secondary">
        Próximo: {formatDate(programacion.fecha_envio)} {formatTime(programacion.hora_envio)}
      </p>
    </div>
  );
}

function EnvioMasivoButton() {
  const { data: configData } = useConfiguracionSistema();
  const actualizarMutation = useActualizarConfiguracionSistema();
  const [modalOpen, setModalOpen] = useState(false);
  const [diaSemana, setDiaSemana] = useState('DOMINGO');
  const [hora, setHora] = useState('20:00');
  const [destinatarios, setDestinatarios] = useState('ACTIVOS');

  const config = configData?.data;
  const activo = !!config?.envio_masivo_activo;

  useEffect(() => {
    if (!config) return;
    setDiaSemana(config.envio_masivo_dia_semana || 'DOMINGO');
    setHora((config.envio_masivo_hora || '20:00:00').slice(0, 5));
    setDestinatarios(config.envio_masivo_destinatarios || 'ACTIVOS');
  }, [config]);

  // El switch usa siempre el día/hora/destinatarios ya guardado (o el
  // default si nunca se configuró); para cambiarlos está el modal, que
  // además activa.
  const alternar = (nuevoActivo) => {
    actualizarMutation.mutate({
      envio_masivo_activo:        nuevoActivo,
      envio_masivo_dia_semana:    config?.envio_masivo_dia_semana || diaSemana,
      envio_masivo_hora:          (config?.envio_masivo_hora || hora).slice(0, 5),
      envio_masivo_destinatarios: config?.envio_masivo_destinatarios || destinatarios,
    });
  };

  const guardarYActivar = () => {
    actualizarMutation.mutate(
      {
        envio_masivo_activo:        true,
        envio_masivo_dia_semana:    diaSemana,
        envio_masivo_hora:          hora,
        envio_masivo_destinatarios: destinatarios,
      },
      { onSuccess: () => setModalOpen(false) }
    );
  };

  return (
    <>
      <div className="flex items-center gap-2 rounded-2xl border border-border-input bg-white px-3 py-2">
        <Toggle
          value={activo}
          trueLabel="Envío masivo activado"
          falseLabel="Envío masivo desactivado"
          onChange={alternar}
        />
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-1 rounded-xl px-2 py-1 text-xs font-medium text-rose hover:underline"
        >
          <Send className="h-3.5 w-3.5" />
          {config
            ? `${DIAS_DISPLAY[config.envio_masivo_dia_semana] || config.envio_masivo_dia_semana} ${String(config.envio_masivo_hora || '').slice(0, 5)}`
            : 'Configurar'}
        </button>
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Envío masivo automático" size="sm">
        <div className="space-y-4">
          <p className="text-sm text-text-secondary">
            El día y la hora que elijas aquí tienen prioridad sobre cualquier envío
            individual que un estudiante ya tuviera agendado: al activarlo (o al guardar un
            cambio de horario), todos los estudiantes activos quedan reagendados exactamente
            a esa fecha y hora. Se repite cada semana hasta que lo desactives con el switch;
            que se haya enviado un mensaje no lo apaga.
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
              ]}
              value={destinatarios}
              onChange={setDestinatarios}
            />
          </div>
          <div className="flex justify-end">
            <Button variant="primary" onClick={guardarYActivar} loading={actualizarMutation.isPending}>
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
  const [limit, setLimit] = useState(10);
  const [programaFilter, setProgramaFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('true');
  const [deleteId, setDeleteId] = useState(null);

  const { data: alumnosData, isLoading } = useAlumnos({
    nombre: search,
    id_programa: programaFilter,
    activo: statusFilter,
    page,
    limit,
  });

  const { data: programasData } = useProgramas({ activo: 'true', limit: 100 });
  const deleteMutation = useEliminarAlumno();

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
      const clave = `${row.fecha_envio}${row.hora_envio}`;
      const claveActual = actual ? `${actual.fecha_envio}${actual.hora_envio}` : null;
      if (!actual || clave < claveActual) {
        mapa.set(key, row);
      }
    }
    return mapa;
  }, [programacionesData]);

  const alumnos = alumnosData?.data || [];
  const pagination = alumnosData?.pagination || {};

  const programas = (programasData?.data || []).map((p) => ({
    value: p.id,
    label: p.nombre,
  }));

  const columns = [
    {
      key: 'nombre',
      label: 'Nombre Completo',
      render: (row) => row.nombre,
    },
    { key: 'telefono', label: 'Teléfono' },
    { key: 'email', label: 'Correo' },
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
        <div className="flex gap-2">
          <button onClick={(e) => { e.stopPropagation(); navigate(`/alumnos/${row.id}`); }} className="text-blue-600 hover:text-blue-800">
            <Eye className="h-4 w-4" />
          </button>
          <button onClick={(e) => { e.stopPropagation(); navigate(`/alumnos/${row.id}/editar`); }} className="text-amber-600 hover:text-amber-800">
            <Edit className="h-4 w-4" />
          </button>
          <button onClick={(e) => { e.stopPropagation(); setDeleteId(row.id); }} className="text-red-600 hover:text-red-800">
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
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="primary" leftIcon={<Plus className="h-4 w-4" />} onClick={() => navigate('/alumnos/nuevo')}>
            Nuevo Estudiante
          </Button>
          <EnvioMasivoButton />
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <SearchBar value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar estudiante por nombre o correo..." />
          <Select
            options={programas}
            value={programaFilter}
            onChange={setProgramaFilter}
            placeholder="Filtrar por programa"
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
          <Table columns={columns} data={alumnos} onRowClick={(row) => navigate(`/alumnos/${row.id}`)} />
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
