import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Edit, Trash2, Plus } from 'lucide-react';
import { PageHeader } from '../../components/shared/PageHeader';
import { Button } from '../../components/ui/Button';
import { SearchBar } from '../../components/ui/SearchBar';
import { Table } from '../../components/ui/Table';
import { SortableHeader } from '../../components/ui/SortableHeader';
import { Pagination } from '../../components/ui/Pagination';
import { EmptyState } from '../../components/shared/EmptyState';
import { ConfirmDialog } from '../../components/shared/ConfirmDialog';
import { Spinner } from '../../components/ui/Spinner';
import { useHorarios, useEliminarHorario } from '../../hooks/useHorarios';

export default function HorariosIndexPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [sortBy, setSortBy] = useState('dia_semana');
  const [sortDir, setSortDir] = useState('asc');
  const [deleteId, setDeleteId] = useState(null);

  const { data: horariosData, isLoading } = useHorarios({
    nombre: search,
    sortBy,
    sortDir,
    page,
    limit,
  });
  const deleteMutation = useEliminarHorario();

  const horarios = horariosData?.data || [];
  const pagination = horariosData?.pagination || {};

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortDir('asc');
    }
  };

  const columns = [
    {
      key: 'alumno_nombre',
      label: (
        <SortableHeader
          column="alumno_nombre"
          label="Student"
          sortBy={sortBy}
          sortDir={sortDir}
          onSort={handleSort}
        />
      ),
    },
    {
      key: 'dia_semana',
      label: (
        <SortableHeader
          column="dia_semana"
          label="Day"
          sortBy={sortBy}
          sortDir={sortDir}
          onSort={handleSort}
        />
      ),
    },
    {
      key: 'hora_inicio',
      label: (
        <SortableHeader
          column="hora_inicio"
          label="Start Time"
          sortBy={sortBy}
          sortDir={sortDir}
          onSort={handleSort}
        />
      ),
    },
    {
      key: 'hora_fin',
      label: (
        <SortableHeader
          column="hora_fin"
          label="End Time"
          sortBy={sortBy}
          sortDir={sortDir}
          onSort={handleSort}
        />
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <div className="flex gap-2">
          <button onClick={() => navigate(`/horarios/${row.id}/editar`)} className="text-amber-600 hover:text-amber-800">
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
      <PageHeader title="Class Schedules" />
      <div className="flex flex-wrap items-center gap-3">
        <Button variant="primary" leftIcon={<Plus className="h-4 w-4" />} onClick={() => navigate('/horarios/nuevo')}>
          New Schedule
        </Button>
      </div>

      <div className="grid gap-4">
        <SearchBar value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search schedules..." />
      </div>

      {isLoading ? (
        <div className="flex h-80 items-center justify-center">
          <Spinner size="lg" />
        </div>
      ) : horarios.length === 0 ? (
        <EmptyState title="No schedules found" actionLabel="Create Schedule" onAction={() => navigate('/horarios/nuevo')} />
      ) : (
        <>
          <Table columns={columns} data={horarios} />
          <Pagination pagination={pagination} onPageChange={setPage} onLimitChange={setLimit} />
        </>
      )}

      <ConfirmDialog
        isOpen={!!deleteId}
        title="Delete Schedule"
        message="Are you sure you want to delete this schedule?"
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
