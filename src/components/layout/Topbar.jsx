import { Bell } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import SearchBar from '../ui/SearchBar';

export function Topbar() {
  const usuario = useAuthStore((state) => state.usuario);
  const notificationCount = 3;

  return (
    <div className="flex h-14 items-center justify-between gap-4 rounded-3xl bg-white border border-border px-5 shadow-sm">
      <div className="flex-1">
        <SearchBar placeholder="Buscar alumno, plan, pago..." value="" onChange={() => {}} />
      </div>
      <div className="flex items-center gap-4">
        <div className="relative">
          <Bell className="h-5 w-5 text-text-secondary" />
          <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] text-white">{notificationCount}</span>
        </div>
        <div className="flex items-center gap-3 rounded-3xl border border-border bg-rose-light px-4 py-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-sm font-semibold text-rose">
            {usuario?.nombre?.[0] || 'S'}
          </div>
          <div className="hidden min-w-[150px] flex-col sm:flex">
            <span className="text-sm font-semibold text-text-primary">{usuario?.nombre ? `${usuario.nombre} ${usuario.apellido || ''}` : 'Sofía Rose'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Topbar;
