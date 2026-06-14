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
import { useUsuarios, useEliminarUsuario } from '../../hooks/useUsuarios';

export default function UsuariosIndexPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [roleFilter, setRoleFilter] = useState('');
  const [deleteId, setDeleteId] = useState(null);

  const { data: usuariosData, isLoading } = useUsuarios({
    nombre: search,
    rol: roleFilter,
    page,
    limit,
  });
  const deleteMutation = useEliminarUsuario();

  const usuarios = usuariosData?.data || [];
  const pagination = usuariosData?.pagination || {};

  const columns = [
    { key: 'nombre_completo', label: 'Full Name' },
    { key: 'email', label: 'Email' },
    { key: 'rol', label: 'Role', render: (row) => <Badge status={row.rol} /> },
    { key: 'activo', label: 'Status', render: (row) => <Badge status={row.activo ? 'PAGADO' : 'PENDIENTE'} /> },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <div className="flex gap-2">
          <button onClick={() => navigate(`/usuarios/${row.id}`)} className="text-blue-600 hover:text-blue-800">
            <Eye className="h-4 w-4" />
          </button>
          <button onClick={() => navigate(`/usuarios/${row.id}/editar`)} className="text-amber-600 hover:text-amber-800">
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
      <PageHeader title="Users" />
      <div className="flex flex-wrap items-center gap-3">
        <Button variant="primary" leftIcon={<Plus className="h-4 w-4" />} onClick={() => navigate('/usuarios/nuevo')}>
          New User
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <SearchBar value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search users..." />
        <Select
          options={[
            { value: 'Admin', label: 'Admin' },
            { value: 'Coordinator', label: 'Coordinator' },
            { value: 'Teacher', label: 'Teacher' },
            { value: 'Staff', label: 'Staff' },
          ]}
          value={roleFilter}
          onChange={setRoleFilter}
          placeholder="Filter by role"
        />
      </div>

      {isLoading ? (
        <div className="flex h-80 items-center justify-center">
          <Spinner size="lg" />
        </div>
      ) : usuarios.length === 0 ? (
        <EmptyState title="No users found" actionLabel="Create User" onAction={() => navigate('/usuarios/nuevo')} />
      ) : (
        <>
          <Table columns={columns} data={usuarios} />
          <Pagination pagination={pagination} onPageChange={setPage} onLimitChange={setLimit} />
        </>
      )}

      <ConfirmDialog
        isOpen={!!deleteId}
        title="Delete User"
        message="Are you sure you want to delete this user?"
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
