import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { PageHeader } from '../../components/shared/PageHeader';
import { Spinner } from '../../components/ui/Spinner';
import { useUsuario } from '../../hooks/useUsuarios';

export default function UsuarioPerfilPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, isLoading } = useUsuario(id);

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  const usuario = data?.data || {};

  return (
    <div className="space-y-6">
      <PageHeader title="Perfil de Usuario" />

      <Card watermark relative>
        <div className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-text-secondary">Nombre Completo</p>
              <p className="text-lg font-semibold text-text-primary">{usuario.nombre_completo}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-text-secondary">RUT</p>
              <p className="text-lg font-semibold text-text-primary">{usuario.rut}</p>
            </div>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-text-secondary">Correo Electrónico</p>
              <p className="text-sm text-text-primary">{usuario.email}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-text-secondary">Rol</p>
              <Badge status={usuario.rol} />
            </div>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-text-secondary">Estado</p>
            <Badge status={usuario.activo ? 'PAGADO' : 'PENDIENTE'} />
          </div>
        </div>
      </Card>

      <div className="flex gap-3 justify-end">
        <Button variant="secondary" onClick={() => navigate('/usuarios')}>
          Back
        </Button>
        <Button variant="primary" onClick={() => navigate(`/usuarios/${id}/editar`)}>
          Edit User
        </Button>
      </div>
    </div>
  );
}
