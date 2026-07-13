import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Edit, Trash2, Plus } from 'lucide-react';
import { PageHeader } from '../../components/shared/PageHeader';
import { Button } from '../../components/ui/Button';
import { SearchBar } from '../../components/ui/SearchBar';
import { Table } from '../../components/ui/Table';
import { Pagination } from '../../components/ui/Pagination';
import { EmptyState } from '../../components/shared/EmptyState';
import { ConfirmDialog } from '../../components/shared/ConfirmDialog';
import { Spinner } from '../../components/ui/Spinner';
import { useProfesores, useEliminarProfesor } from '../../hooks/useProfesores';
import { formatCLP } from '../../utils/formatters';

export default function ProfesoresIndexPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [deleteId, setDeleteId] = useState(null);

  const { data: profesoresData, isLoading } = useProfesores({ nombre: search, page, limit });
  const deleteMutation = useEliminarProfesor();

  const profesores = profesoresData?.data || [];
  const pagination = profesoresData?.pagination || {};

  const columns = [
    { key: 'nombre_completo', label: 'Nombre', render: (row) => `${row.nombre} ${row.apellido}` },
    { key: 'titulo', label: 'Título', render: (row) => row.titulo || '-' },
    { key: 'tarifa_hora_clp', label: 'Tarifa/hora', render: (row) => formatCLP(row.tarifa_hora_clp) },
    { key: 'activo', label: 'Estado', render: (row) => <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${row.activo ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'}`}>{row.activo ? 'Activo' : 'Inactivo'}</span> },
    {
      key: 'actions',
      label: 'Acciones',
      render: (row) => (
        <div className="flex gap-2">
          <button onClick={(e) => { e.stopPropagation(); navigate(`/profesores/${row.id}`); }} className="text-blue-600 hover:text-blue-800">
            <Eye className="h-4 w-4" />
          </button>
          <button onClick={(e) => { e.stopPropagation(); navigate(`/profesores/${row.id}/editar`); }} className="text-amber-600 hover:text-amber-800">
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
      <PageHeader title="Profesores" />
      <div className="flex flex-wrap items-center gap-3">
        <Button variant="primary" leftIcon={<Plus className="h-4 w-4" />} onClick={() => navigate('/profesores/nuevo')}>
          Nuevo Profesor
        </Button>
      </div>

      <div className="grid gap-4">
        <SearchBar value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar profesores..." />
      </div>

      {isLoading ? (
        <div className="flex h-80 items-center justify-center">
          <Spinner size="lg" />
        </div>
      ) : profesores.length === 0 ? (
        <EmptyState title="No se encontraron profesores" actionLabel="Crear Profesor" onAction={() => navigate('/profesores/nuevo')} />
      ) : (
        <>
          <Table columns={columns} data={profesores} onRowClick={(row) => navigate(`/profesores/${row.id}`)} />
          <Pagination pagination={pagination} onPageChange={setPage} onLimitChange={setLimit} />
        </>
      )}

      <ConfirmDialog
        isOpen={!!deleteId}
        title="Desactivar Profesor"
        message="¿Estás seguro de que deseas desactivar este profesor?"
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
