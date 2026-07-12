import { Bell, Smartphone, Menu } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import { GlobalSearch } from '../shared/GlobalSearch';
import { WhatsappModal } from '../shared/WhatsappModal';
import { useWhatsappEstado } from '../../hooks/useWhatsapp';
import { useNotificaciones } from '../../hooks/useProgramacionMensajes';

export function Topbar({ onMenuClick }) {
  const navigate = useNavigate();
  const usuario = useAuthStore((state) => state.usuario);
  const { data: fallidosData } = useNotificaciones({ estado_envio: 'FALLIDO', limit: 1 });
  const notificationCount = fallidosData?.pagination?.total || 0;
  const [modalOpen, setModalOpen] = useState(false);
  // null = todavía no hemos visto un estado real; evita que la primera
  // lectura (normalmente "desconectado" mientras arranca) dispare el modal.
  const prevListo = useRef(null);

  // Consultar estado de WhatsApp globalmente
  const { data: waData } = useWhatsappEstado(true);
  const waEstado = waData?.data;

  // Auto-abrir modal sólo si WhatsApp se desconecta DURANTE la sesión
  // (pasó de conectado a desconectado), nunca en la carga inicial de la app.
  useEffect(() => {
    if (!waEstado) return;
    if (prevListo.current === true && waEstado.listo === false) {
      setModalOpen(true);
    }
    prevListo.current = waEstado.listo;
  }, [waEstado]);

  return (
    <div className="flex h-14 items-center justify-between gap-4 rounded-3xl bg-white border border-border px-5 shadow-sm">
      <button
        type="button"
        onClick={onMenuClick}
        className="shrink-0 rounded-full p-2 text-text-secondary hover:bg-slate-100 lg:hidden"
        aria-label="Abrir menú"
      >
        <Menu className="h-5 w-5" />
      </button>
      <div className="min-w-0 flex-1">
        <GlobalSearch />
      </div>
      <div className="flex items-center gap-4">
        <button 
          onClick={() => setModalOpen(true)}
          className={`relative p-2 rounded-full hover:bg-slate-100 transition ${waEstado?.listo ? 'text-green-600' : 'text-rose'}`}
          title={waEstado?.listo ? "WhatsApp Conectado" : "WhatsApp Desconectado"}
        >
          <Smartphone className="h-5 w-5" />
          {!waEstado?.listo && (
            <span className="absolute right-1.5 top-1.5 flex h-2 w-2 rounded-full bg-rose animate-pulse"></span>
          )}
        </button>

        <button
          type="button"
          onClick={() => navigate('/notificaciones')}
          className="relative rounded-full p-2 text-text-secondary hover:bg-slate-100"
          title="Notificaciones"
        >
          <Bell className="h-5 w-5" />
          {notificationCount > 0 && (
            <span className="absolute right-0.5 top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white">
              {notificationCount > 9 ? '9+' : notificationCount}
            </span>
          )}
        </button>
        <div className="flex items-center gap-3 rounded-3xl border border-border bg-rose-light px-4 py-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-sm font-semibold text-rose">
            {usuario?.nombre?.[0] || 'S'}
          </div>
          <div className="hidden min-w-[150px] flex-col sm:flex">
            <span className="text-sm font-semibold text-text-primary">{usuario?.nombre ? `${usuario.nombre} ${usuario.apellido || ''}` : 'Sofía Rose'}</span>
          </div>
        </div>
      </div>
      
      <WhatsappModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}

export default Topbar;
