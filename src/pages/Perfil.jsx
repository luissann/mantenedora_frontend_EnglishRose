import { PageHeader } from '../components/shared/PageHeader';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import useAuthStore from '../store/authStore';
import { useNavigate } from 'react-router-dom';

export default function PerfilPage() {
  const usuario = useAuthStore((state) => state.usuario);
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <PageHeader title="My Profile" />

      <Card watermark>
        <div className="space-y-6">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-text-secondary">Full Name</p>
            <p className="text-lg font-semibold text-text-primary">{usuario?.nombre} {usuario?.apellido}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-text-secondary">Email</p>
            <p className="text-sm text-text-primary">{usuario?.email}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-text-secondary">Role</p>
            <p className="text-sm text-text-primary">{usuario?.rol}</p>
          </div>
        </div>
      </Card>

      <div className="flex gap-3 justify-end">
        <Button variant="primary">
          Change Password
        </Button>
      </div>
    </div>
  );
}
