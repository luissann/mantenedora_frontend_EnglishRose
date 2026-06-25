import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Edit, Trash2, Plus } from 'lucide-react';
import { PageHeader } from '../../components/shared/PageHeader';
import { Button } from '../../components/ui/Button';
import { SearchBar } from '../../components/ui/SearchBar';
import { Table } from '../../components/ui/Table';
import { Pagination } from '../../components/ui/Pagination';
import { Badge } from '../../components/ui/Badge';
import { EmptyState } from '../../components/shared/EmptyState';
import { ConfirmDialog } from '../../components/shared/ConfirmDialog';
import { Spinner } from '../../components/ui/Spinner';
import { useProgramacionMensajes, useEliminarProgramacionMensaje } from '../../hooks/useProgramacionMensajes';
import { formatDate, formatTime } from '../../utils/formatters';

export default function WhatsappIndexPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [deleteId, setDeleteId] = useState(null);

  const { data: programacionesData, isLoading } = useProgramacionMensajes({
    nombre: search,
    page,
    limit,
  });
  const deleteMutation = useEliminarProgramacionMensaje();

  const programaciones = programacionesData?.data || [];
  const pagination = programacionesData?.pagination || {};

  const columns = [
    { key: 'alumno_nombre', label: 'Alumno' },
    { key: 'fecha_envio', label: 'Fecha de Envío', render: (row) => formatDate(row.fecha_envio) },
    { key: 'hora_envio', label: 'Hora de Envío', render: (row) => formatTime(row.hora_envio) },
    { key: 'mensaje', label: 'Mensaje' },
    { key: 'activo', label: 'Estado', render: (row) => <Badge status={row.activo ? 'PROGRAMADO' : 'PENDIENTE'} /> },
    {
      key: 'actions',
      label: 'Acciones',
      render: (row) => (
        <div className="flex gap-2">
          <button onClick={() => navigate(`/whatsapp/${row.id}/editar`)} className="text-amber-600 hover:text-amber-800">
            <Edit className="h-4 w-4" />
          </button>
          <button onClick={() => setDeleteId(row.id)} className="text-red-600 hover:text-red-800">
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Programación de WhatsApp" />
      <div className="flex flex-wrap items-center gap-3">
        <Button variant="primary" leftIcon={<Plus className="h-4 w-4" />} onClick={() => navigate('/whatsapp/nuevo')}>
          Nuevo Mensaje
        </Button>
      </div>

      <div className="grid gap-4">
        <SearchBar value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar mensajes..." />
      </div>

      {isLoading ? (
        <div className="flex h-80 items-center justify-center">
          <Spinner size="lg" />
        </div>
      ) : programaciones.length === 0 ? (
        <EmptyState title="No se encontraron mensajes" actionLabel="Crear Mensaje" onAction={() => navigate('/whatsapp/nuevo')} />
      ) : (
        <>
          <Table columns={columns} data={programaciones} />
          <Pagination pagination={pagination} onPageChange={setPage} onLimitChange={setLimit} />
        </>
      )}

      <ConfirmDialog
        isOpen={!!deleteId}
        title="Eliminar Mensaje"
        message="¿Estás seguro de que deseas eliminar este mensaje?"
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
