import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Edit, Trash2, Plus } from 'lucide-react';
import { PageHeader } from '../../components/shared/PageHeader';
import { Button } from '../../components/ui/Button';
import { SearchBar } from '../../components/ui/SearchBar';
import { Table } from '../../components/ui/Table';
import { Pagination } from '../../components/ui/Pagination';
import { EmptyState } from '../../components/shared/EmptyState';
import { ConfirmDialog } from '../../components/shared/ConfirmDialog';
import { Spinner } from '../../components/ui/Spinner';
import { useProgramas, useEliminarPrograma } from '../../hooks/useProgramas';
import { formatCLP, formatUSD } from '../../utils/formatters';

export default function ProgramasIndexPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [deleteId, setDeleteId] = useState(null);

  const { data: programasData, isLoading } = useProgramas({
    nombre: search,
    page,
    limit,
  });
  const deleteMutation = useEliminarPrograma();

  const programas = programasData?.data || [];
  const pagination = programasData?.pagination || {};

  const columns = [
    { key: 'nombre', label: 'Nombre del Programa' },
    { key: 'descripcion', label: 'Descripción' },
    { key: 'precio_clp', label: 'Precio CLP', render: (row) => formatCLP(row.precio_clp) },
    { key: 'precio_usd', label: 'Precio USD', render: (row) => formatUSD(row.precio_usd) },
    { key: 'clases_semana', label: 'Clases por semana' },
    { key: 'activo', label: 'Estado', render: (row) => <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${row.activo ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'}`}>{row.activo ? 'Activo' : 'Inactivo'}</span> },
    {
      key: 'actions',
      label: 'Acciones',
      render: (row) => (
        <div className="flex gap-2">
          <button onClick={() => navigate(`/programas/${row.id}/editar`)} className="text-amber-600 hover:text-amber-800">
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
      <PageHeader title="Programas" />
      <div className="flex flex-wrap items-center gap-3">
        <Button variant="primary" leftIcon={<Plus className="h-4 w-4" />} onClick={() => navigate('/programas/nuevo')}>
          Nuevo Programa
        </Button>
      </div>

      <div className="grid gap-4">
        <SearchBar value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar programas..." />
      </div>

      {isLoading ? (
        <div className="flex h-80 items-center justify-center">
          <Spinner size="lg" />
        </div>
      ) : programas.length === 0 ? (
        <EmptyState title="No se encontraron programas" actionLabel="Crear Programa" onAction={() => navigate('/programas/nuevo')} />
      ) : (
        <>
          <Table columns={columns} data={programas} />
          <Pagination pagination={pagination} onPageChange={setPage} onLimitChange={setLimit} />
        </>
      )}

      <ConfirmDialog
        isOpen={!!deleteId}
        title="Eliminar Programa"
        message="¿Estás seguro de que deseas eliminar este programa?"
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
