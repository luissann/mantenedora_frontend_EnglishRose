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
    { key: 'alumno_nombre', label: 'Student' },
    { key: 'dia_envio', label: 'Send Day' },
    { key: 'hora_envio', label: 'Send Time' },
    { key: 'mensaje', label: 'Message' },
    { key: 'activo', label: 'Status', render: (row) => <Badge status={row.activo ? 'PAGADO' : 'PENDIENTE'} /> },
    {
      key: 'actions',
      label: 'Actions',
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
      <PageHeader title="WhatsApp Scheduling" />
      <div className="flex flex-wrap items-center gap-3">
        <Button variant="primary" leftIcon={<Plus className="h-4 w-4" />} onClick={() => navigate('/whatsapp/nuevo')}>
          New Message
        </Button>
      </div>

      <div className="grid gap-4">
        <SearchBar value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search messages..." />
      </div>

      {isLoading ? (
        <div className="flex h-80 items-center justify-center">
          <Spinner size="lg" />
        </div>
      ) : programaciones.length === 0 ? (
        <EmptyState title="No messages found" actionLabel="Create Message" onAction={() => navigate('/whatsapp/nuevo')} />
      ) : (
        <>
          <Table columns={columns} data={programaciones} />
          <Pagination pagination={pagination} onPageChange={setPage} onLimitChange={setLimit} />
        </>
      )}

      <ConfirmDialog
        isOpen={!!deleteId}
        title="Delete Message"
        message="Are you sure you want to delete this message?"
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
