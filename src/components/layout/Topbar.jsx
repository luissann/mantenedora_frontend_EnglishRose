import { Bell, Smartphone } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import useAuthStore from '../../store/authStore';
import SearchBar from '../ui/SearchBar';
import { WhatsappModal } from '../shared/WhatsappModal';
import { useWhatsappEstado } from '../../hooks/useWhatsapp';

export function Topbar() {
  const usuario = useAuthStore((state) => state.usuario);
  const notificationCount = 3;
  const [modalOpen, setModalOpen] = useState(false);
  const prevListo = useRef(true);

  // Consultar estado de WhatsApp globalmente
  const { data: waData } = useWhatsappEstado(true);
  const waEstado = waData?.data;

  // Auto-abrir modal si se desconecta repentinamente
  useEffect(() => {
    if (waEstado && waEstado.listo !== prevListo.current) {
      if (prevListo.current === true && waEstado.listo === false) {
        setModalOpen(true); // Se desconectó, abrir modal
      }
      prevListo.current = waEstado.listo;
    }
  }, [waEstado]);

  return (
    <div className="flex h-14 items-center justify-between gap-4 rounded-3xl bg-white border border-border px-5 shadow-sm">
      <div className="flex-1">
        <SearchBar placeholder="Buscar alumno, plan, pago..." value="" onChange={() => {}} />
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
      
      <WhatsappModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}

export default Topbar;
