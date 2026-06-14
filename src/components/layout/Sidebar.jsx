import { LayoutDashboard, GraduationCap, CreditCard, Layers, Clock, MessageCircle, Users, Settings, LogOut } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import useAuthStore from '../../store/authStore';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/alumnos', label: 'Alumnos', icon: GraduationCap },
  { to: '/pagos', label: 'Pagos', icon: CreditCard },
  { to: '/planes', label: 'Planes', icon: Layers },
  { to: '/horarios', label: 'Horarios', icon: Clock },
  { to: '/whatsapp', label: 'Programación WhatsApp', icon: MessageCircle },
  { to: '/usuarios', label: 'Usuarios', icon: Users },
  { to: '/configuracion', label: 'Configuración', icon: Settings },
];

export function Sidebar() {
  const logout = useAuthStore((state) => state.logout);

  return (
    <aside className="hidden h-screen w-[220px] flex-col border-r border-border bg-white px-4 py-6 lg:flex">
      <div className="mb-10 flex items-center gap-3 px-2">
        <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-rose-light text-rose text-2xl font-playfair">SR</div>
        <div>
          <p className="text-sm uppercase tracking-[0.18em] text-text-secondary">Sofi Rose</p>
          <p className="text-base font-playfair text-text-primary">Academy</p>
        </div>
      </div>

      <nav className="space-y-1">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-3xl px-4 py-3 text-sm font-medium transition ${
                isActive ? 'bg-rose-light text-rose' : 'text-text-secondary hover:bg-rose-light/70'
              }`
            }
          >
            <Icon className="h-5 w-5" />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto px-2">
        <button
          type="button"
          onClick={logout}
          className="flex w-full items-center gap-3 rounded-3xl border border-border px-4 py-3 text-sm text-text-secondary transition hover:bg-rose-light"
        >
          <LogOut className="h-5 w-5" />
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
