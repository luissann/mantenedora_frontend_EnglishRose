import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Edit, Trash2, Plus } from 'lucide-react';
import { PageHeader } from '../../components/shared/PageHeader';
import { Button } from '../../components/ui/Button';
import { SearchBar } from '../../components/ui/SearchBar';
import { Select } from '../../components/ui/Select';
import { Table } from '../../components/ui/Table';
import { Pagination } from '../../components/ui/Pagination';
import { Toggle } from '../../components/ui/Toggle';
import { EmptyState } from '../../components/shared/EmptyState';
import { ConfirmDialog } from '../../components/shared/ConfirmDialog';
import { Spinner } from '../../components/ui/Spinner';
import { useAlumnos, useEliminarAlumno } from '../../hooks/useAlumnos';
import { useProgramas } from '../../hooks/useProgramas';
import {
  useProgramacionMensajes,
  useActualizarProgramacionMensaje,
  useCrearProgramacionMensaje,
} from '../../hooks/useProgramacionMensajes';
import { formatDate, formatTime } from '../../utils/formatters';


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
      render: (row) => [row.nombre, row.segundo_nombre, row.apellido, row.segundo_apellido].filter(Boolean).join(' '),
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
      <PageHeader title="Alumnos" />
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="primary" leftIcon={<Plus className="h-4 w-4" />} onClick={() => navigate('/alumnos/nuevo')}>
            Nuevo Alumno
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <SearchBar value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar alumno por nombre o correo..." />
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
        <EmptyState title="No se encontraron alumnos" actionLabel="Crear Alumno" onAction={() => navigate('/alumnos/nuevo')} />
      ) : (
        <>
          <Table columns={columns} data={alumnos} onRowClick={(row) => navigate(`/alumnos/${row.id}`)} />
          <Pagination pagination={pagination} onPageChange={setPage} onLimitChange={setLimit} />
        </>
      )}

      <ConfirmDialog
        isOpen={!!deleteId}
        title="Eliminar Alumno"
        message="¿Estás seguro de que deseas eliminar este alumno? Esta acción no se puede deshacer."
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
