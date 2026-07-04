import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Edit, Trash2, Plus } from 'lucide-react';
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
import { useAlumnos, useEliminarAlumno } from '../../hooks/useAlumnos';
import { usePlanes } from '../../hooks/usePlanes';
import { formatDate } from '../../utils/formatters';

export default function AlumnosPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [planFilter, setPlanFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [deleteId, setDeleteId] = useState(null);

 const {
  data: alumnosData,
  isLoading,
  error,
} = useAlumnos({
  nombre: search,
  id_plan: planFilter,
  activo: statusFilter,
  page,
  limit,
});

console.log("ALUMNOS:", alumnosData);
console.log("ERROR:", error);

  const { data: planesData } = usePlanes();
  const deleteMutation = useEliminarAlumno();

  const alumnos = alumnosData?.data || [];
  const pagination = alumnosData?.pagination || {};

  const planes = (planesData?.data || []).map((p) => ({
    value: p.id,
    label: p.nombre,
  }));

  const columns = [
    { key: 'nombre', label: 'Full Name' },
    {key: 'segundo_nombre', label: 'Second Name'},
    { key: 'telefono', label: 'Phone' },
    { key: 'email', label: 'Email' },
    {
      key: 'plan',
      label: 'Plan',
      render: (row) => row.plan?.nombre || 'Sin plan'
    },
    { key: 'estado_pago', label: 'Payment Status', render: (row) => <Badge status={row.estado_pago} /> },
    { key: 'fecha_vencimiento', label: 'Monthly Expiration Date', render: (row) => formatDate(row.fecha_vencimiento) },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <div className="flex gap-2">
          <button onClick={() => navigate(`/alumnos/${row.id}`)} className="text-blue-600 hover:text-blue-800">
            <Eye className="h-4 w-4" />
          </button>
          <button onClick={() => navigate(`/alumnos/${row.id}/editar`)} className="text-amber-600 hover:text-amber-800">
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
      <PageHeader title="Students" />
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="primary" leftIcon={<Plus className="h-4 w-4" />} onClick={() => navigate('/alumnos/nuevo')}>
            New Student
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <SearchBar value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search student by name or email..." />
          <Select
            options={planes}
            value={planFilter}
            onChange={setPlanFilter}
            placeholder="Filter by plan"
            searchable
          />
          <Select
            options={[
              { value: 'true', label: 'Active' },
              { value: 'false', label: 'Inactive' },
            ]}
            value={statusFilter}
            onChange={setStatusFilter}
            placeholder="Filter by status"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex h-80 items-center justify-center">
          <Spinner size="lg" />
        </div>
      ) : alumnos.length === 0 ? (
        <EmptyState title="No students found" actionLabel="Create Student" onAction={() => navigate('/alumnos/nuevo')} />
      ) : (
        <>
          <Table columns={columns} data={alumnos} />
          <Pagination pagination={pagination} onPageChange={setPage} onLimitChange={setLimit} />
        </>
      )}

      <ConfirmDialog
        isOpen={!!deleteId}
        title="Delete Student"
        message="Are you sure you want to delete this student? This action cannot be undone."
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
