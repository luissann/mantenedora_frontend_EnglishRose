import { LayoutDashboard, GraduationCap, Layers, Clock, Users, Settings, LogOut, X, UserCog } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import useAuthStore from '../../store/authStore';

// Primera etapa: solo lo pedido (envío de WhatsApp automático + lo mínimo
// para sostenerlo). Pagos, Boletas y Pagos a Profesores quedan desarrollados
// pero ocultos y bloqueados (ver router/index.jsx) para habilitarlos en una
// etapa siguiente. Programas se habilitó porque el nuevo flujo de Alumnos
// depende de poder crear/editar Programas para asignarlos. El módulo
// standalone de WhatsApp se eliminó: la programación de mensajes ahora se
// administra directamente desde el perfil de cada Alumno.
const navItems = [
  { to: '/dashboard', label: 'Panel Principal', icon: LayoutDashboard },
  { to: '/alumnos', label: 'Alumnos', icon: GraduationCap },
  { to: '/programas', label: 'Programas', icon: Layers },
  { to: '/profesores', label: 'Profesores', icon: UserCog },
  { to: '/horarios', label: 'Horarios', icon: Clock },
  { to: '/usuarios', label: 'Usuarios', icon: Users },
  { to: '/configuracion', label: 'Configuración', icon: Settings },
];

function SidebarContent({ logout, onNavigate }) {
  return (
    <>
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
            onClick={onNavigate}
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
    </>
  );
}

export function Sidebar({ isOpen = false, onClose }) {
  const logout = useAuthStore((state) => state.logout);

  return (
    <>
      {/* Sidebar fija en desktop */}
      <aside className="sticky top-16 hidden h-[calc(100vh-4rem)] w-[220px] flex-col border-r border-border bg-white px-4 py-6 lg:flex">
        <SidebarContent logout={logout} />
      </aside>

      {/* Drawer en mobile/tablet */}
      <div className={`fixed inset-0 z-50 lg:hidden ${isOpen ? '' : 'pointer-events-none'}`}>
        <div
          className={`absolute inset-0 bg-black/40 transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0'}`}
          onClick={onClose}
          aria-hidden="true"
        />
        <aside
          className={`absolute left-0 top-0 flex h-screen w-[260px] flex-col overflow-y-auto bg-white px-4 py-6 shadow-2xl transition-transform duration-200 ${
            isOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <button
            type="button"
            onClick={onClose}
            className="mb-4 self-end rounded-full p-2 text-text-secondary hover:bg-rose-light/70"
            aria-label="Cerrar menú"
          >
            <X className="h-5 w-5" />
          </button>
          <SidebarContent logout={logout} onNavigate={onClose} />
        </aside>
      </div>
    </>
  );
}

export default Sidebar;
