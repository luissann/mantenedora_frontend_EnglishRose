import { useState } from 'react';
import { Check, Trash2, RotateCcw, Mail, MessageCircle, Phone, Tag } from 'lucide-react';
import { PageHeader } from '../../components/shared/PageHeader';
import { EmptyState } from '../../components/shared/EmptyState';
import { ConfirmDialog } from '../../components/shared/ConfirmDialog';
import { FilterTabs } from '../../components/ui/FilterTabs';
import { Pagination } from '../../components/ui/Pagination';
import { Spinner } from '../../components/ui/Spinner';
import { Button } from '../../components/ui/Button';
import { formatDateTime } from '../../utils/formatters';
import {
  useMensajes,
  useResumenMensajes,
  useMarcarLeidoMensaje,
  useEliminarMensaje,
} from '../../hooks/useMensajes';

// El mensaje se muestra como un globo de texto (como un chat): rosado si es nuevo, gris si ya se leyó.
const GLOBO = {
  nuevo: { globo: 'border-rose/25 bg-rose-light/70', cola: 'border-rose/25 bg-rose-light/70' },
  leido: { globo: 'border-slate-200 bg-slate-100/80', cola: 'border-slate-200 bg-slate-100/80' },
};

const iniciales = (nombre) => (nombre || '?').split(' ').filter(Boolean).map((p) => p[0]).join('').slice(0, 2).toUpperCase();

// Número para wa.me: solo dígitos y con el 56 de Chile si viene como celular de 9 dígitos (9XXXXXXXX).
function numeroWhatsApp(telefono) {
  const digitos = String(telefono || '').replace(/\D/g, '').replace(/^0+/, '');
  if (digitos.length === 9 && digitos.startsWith('9')) return `56${digitos}`;
  if (digitos.length === 8) return `569${digitos}`;
  return digitos.length >= 8 ? digitos : '';
}

export default function MensajesPage() {
  const [filtro, setFiltro] = useState('false');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [eliminarId, setEliminarId] = useState(null);

  const { data, isLoading } = useMensajes({ leido: filtro || undefined, page, limit });
  const { data: resumenResp } = useResumenMensajes();
  const marcar = useMarcarLeidoMensaje();
  const eliminar = useEliminarMensaje();

  const mensajes = data?.data || [];
  const pagination = data?.pagination || {};
  const resumen = resumenResp?.data || { nuevos: 0, leidos: 0, total: 0 };

  const tabs = [
    { value: 'false', label: `Nuevos (${resumen.nuevos})` },
    { value: 'true', label: `Leídos (${resumen.leidos})` },
    { value: '', label: `Todos (${resumen.total})` },
  ];

  const cambiarTab = (valor) => { setFiltro(valor); setPage(1); };

  return (
    <div className="space-y-6">
      <PageHeader title="Mensajes" />
      <p className="text-sm text-text-secondary">
        Lo que las personas escriben en el formulario de <strong>Contacto</strong> de la web llega acá como <strong>nuevo</strong>. Responde por WhatsApp o email y márcalo como leído.
      </p>

      <FilterTabs tabs={tabs} activeTab={filtro} onChange={cambiarTab} />

      {isLoading ? (
        <div className="flex h-60 items-center justify-center"><Spinner size="lg" /></div>
      ) : mensajes.length === 0 ? (
        <EmptyState
          title={filtro === 'false' ? 'No hay mensajes nuevos' : 'No hay mensajes en esta categoría'}
          subtitle="Cuando alguien escriba desde el formulario de Contacto de la web, aparecerá acá."
        />
      ) : (
        <>
          <div className="grid gap-6">
            {mensajes.map((m) => {
              const gl = m.leido ? GLOBO.leido : GLOBO.nuevo;
              const wa = numeroWhatsApp(m.telefono);
              const asunto = encodeURIComponent('Re: tu consulta en English Rose Academy');
              return (
                <article key={m.id} className="flex gap-3 sm:gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-rose-light font-playfair text-lg text-rose ring-2 ring-white sm:h-12 sm:w-12" aria-hidden="true">
                    {iniciales(m.nombre)}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                        <h3 className="text-base font-semibold text-text-primary">{m.nombre}</h3>
                        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] ${m.leido ? 'bg-slate-100 text-slate-600' : 'bg-yellow-100 text-yellow-800'}`}>
                          {m.leido ? 'Leído' : 'Nuevo'}
                        </span>
                      </div>
                      <span className="text-xs text-text-secondary">{formatDateTime(m.created_at)}</span>
                    </div>

                    <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-text-secondary">
                      <span className="inline-flex items-center gap-1.5 break-all"><Mail className="h-3.5 w-3.5 shrink-0" /> {m.email}</span>
                      {m.telefono && <span className="inline-flex items-center gap-1.5"><Phone className="h-3.5 w-3.5 shrink-0" /> {m.telefono}</span>}
                      {m.servicio && <span className="inline-flex items-center gap-1.5"><Tag className="h-3.5 w-3.5 shrink-0" /> {m.servicio}</span>}
                    </div>

                    {/* Globo de texto con cola hacia el avatar */}
                    <div className={`relative mt-3 rounded-3xl rounded-tl-md border px-6 py-5 shadow-sm ${gl.globo}`}>
                      <span className={`absolute -left-[7px] top-4 hidden h-3.5 w-3.5 rotate-45 border-b border-l sm:block ${gl.cola}`} aria-hidden="true" />
                      <p className="whitespace-pre-line break-words text-[15px] leading-relaxed text-text-primary">{m.mensaje}</p>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      {wa && (
                        <a
                          href={`https://wa.me/${wa}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 rounded-2xl bg-[#25d366] px-3 py-2 text-sm font-medium text-white transition hover:brightness-95"
                        >
                          <MessageCircle className="h-4 w-4" /> Responder por WhatsApp
                        </a>
                      )}
                      <a
                        href={`mailto:${m.email}?subject=${asunto}`}
                        className="inline-flex items-center gap-2 rounded-2xl border border-border bg-white px-3 py-2 text-sm font-medium text-text-primary transition hover:bg-rose-light"
                      >
                        <Mail className="h-4 w-4" /> Responder por email
                      </a>
                      {m.leido ? (
                        <Button size="sm" variant="secondary" leftIcon={<RotateCcw className="h-4 w-4" />} onClick={() => marcar.mutate({ id: m.id, leido: false })} disabled={marcar.isPending}>
                          Marcar como no leído
                        </Button>
                      ) : (
                        <Button size="sm" leftIcon={<Check className="h-4 w-4" />} onClick={() => marcar.mutate({ id: m.id, leido: true })} disabled={marcar.isPending}>
                          Marcar como leído
                        </Button>
                      )}
                      <Button size="sm" variant="ghost" leftIcon={<Trash2 className="h-4 w-4 text-red-600" />} onClick={() => setEliminarId(m.id)}>
                        <span className="text-red-600">Eliminar</span>
                      </Button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
          <Pagination pagination={pagination} onPageChange={setPage} onLimitChange={setLimit} />
        </>
      )}

      <ConfirmDialog
        isOpen={!!eliminarId}
        title="Eliminar mensaje"
        message="Se eliminará definitivamente. Si solo quieres sacarlo de los nuevos, usa “Marcar como leído”."
        onConfirm={() => { eliminar.mutate(eliminarId); setEliminarId(null); }}
        onCancel={() => setEliminarId(null)}
        loading={eliminar.isPending}
      />
    </div>
  );
}
