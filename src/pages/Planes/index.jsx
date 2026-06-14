import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Edit, Trash2, Plus } from 'lucide-react';
import { PageHeader } from '../../components/shared/PageHeader';
import { Button } from '../../components/ui/Button';
import { SearchBar } from '../../components/ui/SearchBar';
import { Table } from '../../components/ui/Table';
import { Pagination } from '../../components/ui/Pagination';
import { Card } from '../../components/ui/Card';
import { EmptyState } from '../../components/shared/EmptyState';
import { ConfirmDialog } from '../../components/shared/ConfirmDialog';
import { Spinner } from '../../components/ui/Spinner';
import { usePlanes, useEliminarPlan } from '../../hooks/usePlanes';
import { formatCLP } from '../../utils/formatters';

export default function PlanesIndexPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [deleteId, setDeleteId] = useState(null);

  const { data: planesData, isLoading } = usePlanes({
    nombre: search,
    page,
    limit,
  });
  const deleteMutation = useEliminarPlan();

  const planes = planesData?.data || [];
  const pagination = planesData?.pagination || {};

  const columns = [
    { key: 'nombre', label: 'Plan Name' },
    { key: 'descripcion', label: 'Description' },
    { key: 'precio', label: 'Price', render: (row) => formatCLP(row.precio) },
    { key: 'duracion_meses', label: 'Duration (months)' },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <div className="flex gap-2">
          <button onClick={() => navigate(`/planes/${row.id}/editar`)} className="text-amber-600 hover:text-amber-800">
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
      <PageHeader title="Plans" />
      <div className="flex flex-wrap items-center gap-3">
        <Button variant="primary" leftIcon={<Plus className="h-4 w-4" />} onClick={() => navigate('/planes/nuevo')}>
          New Plan
        </Button>
      </div>

      <div className="grid gap-4">
        <SearchBar value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search plans..." />
      </div>

      {isLoading ? (
        <div className="flex h-80 items-center justify-center">
          <Spinner size="lg" />
        </div>
      ) : planes.length === 0 ? (
        <EmptyState title="No plans found" actionLabel="Create Plan" onAction={() => navigate('/planes/nuevo')} />
      ) : (
        <>
          <Table columns={columns} data={planes} />
          <Pagination pagination={pagination} onPageChange={setPage} onLimitChange={setLimit} />
        </>
      )}

      <ConfirmDialog
        isOpen={!!deleteId}
        title="Delete Plan"
        message="Are you sure you want to delete this plan?"
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
