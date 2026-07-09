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
  const nombreCompleto = [usuario.nombre, usuario.segundo_nombre, usuario.apellido, usuario.segundo_apellido].filter(Boolean).join(' ');

  return (
    <div className="space-y-6">
      <PageHeader title="Perfil de Usuario" />

      <Card watermark relative>
        <div className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-text-secondary">Nombre Completo</p>
              <p className="text-lg font-semibold text-text-primary">{nombreCompleto || usuario.nombre_completo || 'Sin nombre'}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-text-secondary">RUT</p>
              <p className="text-lg font-semibold text-text-primary">{usuario.rut}</p>
            </div>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-text-secondary">Correo Electrónico</p>
              <p className="text-sm text-text-primary">{usuario.email || 'Sin correo'}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-text-secondary">Rol</p>
              <span className="text-sm font-semibold text-text-primary">
                {usuario.rol === 'Admin' ? 'Administrador' : usuario.rol === 'Coordinator' ? 'Coordinador' : usuario.rol === 'Teacher' ? 'Profesor' : usuario.rol === 'Staff' ? 'Personal' : usuario.rol || 'Sin rol'}
              </span>
            </div>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-text-secondary">Estado</p>
            <Badge status={usuario.activo ? 'Active' : 'Inactive'} />
          </div>
        </div>
      </Card>

      <div className="flex gap-3 justify-end">
        <Button variant="secondary" onClick={() => navigate('/usuarios')}>
          Volver
        </Button>
        <Button variant="primary" onClick={() => navigate(`/usuarios/${id}/editar`)}>
          Editar Usuario
        </Button>
      </div>
    </div>
  );
}
