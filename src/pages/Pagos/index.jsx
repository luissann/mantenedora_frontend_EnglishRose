import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Edit, Trash2, Plus } from 'lucide-react';
import { PageHeader } from '../../components/shared/PageHeader';
import { Button } from '../../components/ui/Button';
import { SearchBar } from '../../components/ui/SearchBar';
import { Select } from '../../components/ui/Select';
import { Table } from '../../components/ui/Table';
import { Pagination } from '../../components/ui/Pagination';
import { Badge } from '../../components/ui/Badge';
import { EmptyState } from '../../components/shared/EmptyState';
import { ConfirmDialog } from '../../components/shared/ConfirmDialog';
import { Spinner } from '../../components/ui/Spinner';
import { usePagos, useEliminarPago } from '../../hooks/usePagos';
import { formatCLP, formatDate } from '../../utils/formatters';

export default function PagosIndexPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [statusFilter, setStatusFilter] = useState('');
  const [deleteId, setDeleteId] = useState(null);

  const alumnoId = searchParams.get('alumno');

  const { data: pagosData, isLoading } = usePagos({
    id_alumno: alumnoId,
    estado: statusFilter,
    page,
    limit,
  });
  const deleteMutation = useEliminarPago();

  const pagos = pagosData?.data || [];
  const pagination = pagosData?.pagination || {};

  const columns = [
    { key: 'alumno_nombre', label: 'Student' },
    { key: 'fecha_pago', label: 'Payment Date', render: (row) => formatDate(row.fecha_pago) },
    { key: 'monto', label: 'Amount', render: (row) => formatCLP(row.monto) },
    { key: 'metodo_pago', label: 'Method' },
    { key: 'estado', label: 'Status', render: (row) => <Badge status={row.estado} /> },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <div className="flex gap-2">
          <button onClick={() => navigate(`/pagos/${row.id}/editar`)} className="text-amber-600 hover:text-amber-800">
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
      <PageHeader title="Pagos" />
      <div className="flex flex-wrap items-center gap-3">
        <Button variant="primary" leftIcon={<Plus className="h-4 w-4" />} onClick={() => navigate('/pagos/nuevo')}>
          New Payment
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <SearchBar value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar pagos..." />
        <Select
          options={[
            { value: 'PAGADO', label: 'Paid' },
            { value: 'PENDIENTE', label: 'Pending' },
            { value: 'VENCIDO', label: 'Overdue' },
          ]}
          value={statusFilter}
          onChange={setStatusFilter}
          placeholder="Filter by status"
        />
      </div>

      {isLoading ? (
        <div className="flex h-80 items-center justify-center">
          <Spinner size="lg" />
        </div>
      ) : pagos.length === 0 ? (
        <EmptyState title="No se encontraron pagos" actionLabel="Crear Pago" onAction={() => navigate('/pagos/nuevo')} />
      ) : (
        <>
          <Table columns={columns} data={pagos} />
          <Pagination pagination={pagination} onPageChange={setPage} onLimitChange={setLimit} />
        </>
      )}

      <ConfirmDialog
        isOpen={!!deleteId}
        title="Eliminar Pago"
        message="¿Estás seguro de que deseas eliminar este pago?"
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
