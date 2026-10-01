import { useState } from 'react';
import { Check, X, Pencil, Trash2, RotateCcw, Star, Mail } from 'lucide-react';
import { PageHeader } from '../../components/shared/PageHeader';
import { EmptyState } from '../../components/shared/EmptyState';
import { ConfirmDialog } from '../../components/shared/ConfirmDialog';
import { FilterTabs } from '../../components/ui/FilterTabs';
import { Pagination } from '../../components/ui/Pagination';
import { Spinner } from '../../components/ui/Spinner';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { formatDateTime } from '../../utils/formatters';
import {
  useTestimonios,
  useResumenTestimonios,
  useCambiarEstadoTestimonio,
  useActualizarTestimonio,
  useEliminarTestimonio,
} from '../../hooks/useTestimonios';

const ESTADO_ESTILO = {
  PENDIENTE: { label: 'Pendiente', className: 'bg-yellow-100 text-yellow-800' },
  APROBADO: { label: 'Aprobado', className: 'bg-green-100 text-green-800' },
  RECHAZADO: { label: 'Rechazado', className: 'bg-red-100 text-red-800' },
};

function Estrellas({ valor }) {
  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`${valor} de 5 estrellas`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star key={n} className={`h-4 w-4 ${n <= valor ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} />
      ))}
    </span>
  );
}

function EditarModal({ testimonio, onClose }) {
  const actualizar = useActualizarTestimonio();
  const [form, setForm] = useState({
    nombre: testimonio.nombre || '',
    rol: testimonio.rol || '',
    clases: testimonio.clases || '',
    calificacion: testimonio.calificacion || 5,
    texto: testimonio.texto || '',
  });
  const set = (campo) => (e) => setForm((f) => ({ ...f, [campo]: e.target.value }));

  const guardar = (e) => {
    e.preventDefault();
    actualizar.mutate(
      { id: testimonio.id, ...form, calificacion: Number(form.calificacion) },
      { onSuccess: onClose }
    );
  };

  return (
    <Modal isOpen title="Editar testimonio" onClose={onClose}>
      <form onSubmit={guardar} className="space-y-4">
        <Input label="Nombre (como se mostrará)" value={form.nombre} onChange={set('nombre')} required maxLength={80} />
        <div className="grid gap-4 md:grid-cols-2">
          <Input label="Rol (opcional)" value={form.rol} onChange={set('rol')} maxLength={100} />
          <Input label="Clases (opcional)" value={form.clases} onChange={set('clases')} maxLength={30} />
        </div>
        <div>
          <label className="text-sm text-text-secondary">Calificación</label>
          <select
            value={form.calificacion}
            onChange={set('calificacion')}
            className="mt-2 w-full rounded-2xl border border-border-input bg-white px-4 py-3 text-sm outline-none focus:border-rose focus:ring-2 focus:ring-rose/20"
          >
            {[5, 4, 3, 2, 1].map((n) => (
              <option key={n} value={n}>{'★'.repeat(n)} ({n}/5)</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-sm text-text-secondary">Testimonio</label>
          <textarea
            value={form.texto}
            onChange={set('texto')}
            rows={6}
            minLength={15}
            maxLength={800}
            required
            className="mt-2 w-full rounded-2xl border border-border-input bg-white px-4 py-3 text-sm outline-none focus:border-rose focus:ring-2 focus:ring-rose/20"
          />
          <p className="mt-1 text-xs text-text-secondary">{form.texto.length}/800. Útil para corregir erratas antes de publicar.</p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
          <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button type="submit" loading={actualizar.isPending}>Guardar cambios</Button>
        </div>
      </form>
    </Modal>
  );
}

export default function TestimoniosPage() {
  const [estado, setEstado] = useState('PENDIENTE');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [editando, setEditando] = useState(null);
  const [eliminarId, setEliminarId] = useState(null);

  const { data, isLoading } = useTestimonios({ estado: estado || undefined, page, limit });
  const { data: resumenResp } = useResumenTestimonios();
  const cambiarEstado = useCambiarEstadoTestimonio();
  const eliminar = useEliminarTestimonio();

  const testimonios = data?.data || [];
  const pagination = data?.pagination || {};
  const resumen = resumenResp?.data || { pendientes: 0, aprobados: 0, rechazados: 0 };

  const tabs = [
    { value: 'PENDIENTE', label: `Pendientes (${resumen.pendientes})` },
    { value: 'APROBADO', label: `Aprobados (${resumen.aprobados})` },
    { value: 'RECHAZADO', label: `Rechazados (${resumen.rechazados})` },
    { value: '', label: 'Todos' },
  ];

  const cambiarTab = (valor) => { setEstado(valor); setPage(1); };
  const mover = (id, nuevo) => cambiarEstado.mutate({ id, estado: nuevo });

  return (
    <div className="space-y-6">
      <PageHeader title="Testimonios" />
      <p className="text-sm text-text-secondary">
        Lo que las personas escriben en la web llega acá como <strong>pendiente</strong>. Solo los <strong>aprobados</strong> se muestran en el sitio.
      </p>

      <FilterTabs tabs={tabs} activeTab={estado} onChange={cambiarTab} />

      {isLoading ? (
        <div className="flex h-60 items-center justify-center"><Spinner size="lg" /></div>
      ) : testimonios.length === 0 ? (
        <EmptyState
          title={estado === 'PENDIENTE' ? 'No hay testimonios por revisar' : 'No hay testimonios en esta categoría'}
          subtitle="Cuando alguien envíe uno desde la web, aparecerá acá."
        />
      ) : (
        <>
          <div className="grid gap-4">
            {testimonios.map((t) => {
              const est = ESTADO_ESTILO[t.estado] || ESTADO_ESTILO.PENDIENTE;
              return (
                <article key={t.id} className="rounded-3xl border border-border bg-white p-6 shadow-sm">
                  <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-3">
                        <h3 className="text-lg font-semibold text-text-primary">{t.nombre}</h3>
                        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] ${est.className}`}>{est.label}</span>
                      </div>
                      <p className="mt-1 text-sm text-text-secondary">
                        {[t.rol, t.clases ? `${t.clases} clases` : null].filter(Boolean).join(' · ') || 'Sin rol indicado'}
                      </p>
                    </div>
                    <div className="flex flex-col items-start gap-1 md:items-end">
                      <Estrellas valor={t.calificacion} />
                      <span className="text-xs text-text-secondary">{formatDateTime(t.created_at)}</span>
                    </div>
                  </div>

                  <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-text-primary">“{t.texto}”</p>

                  {t.email && (
                    <p className="mt-3 flex items-center gap-2 text-xs text-text-secondary">
                      <Mail className="h-3.5 w-3.5" /> {t.email} <span className="text-slate-400">(privado, no se publica)</span>
                    </p>
                  )}

                  <div className="mt-5 flex flex-wrap gap-2">
                    {t.estado !== 'APROBADO' && (
                      <Button size="sm" leftIcon={<Check className="h-4 w-4" />} onClick={() => mover(t.id, 'APROBADO')} disabled={cambiarEstado.isPending}>
                        Aprobar y publicar
                      </Button>
                    )}
                    {t.estado === 'PENDIENTE' && (
                      <Button size="sm" variant="secondary" leftIcon={<X className="h-4 w-4" />} onClick={() => mover(t.id, 'RECHAZADO')} disabled={cambiarEstado.isPending}>
                        Rechazar
                      </Button>
                    )}
                    {t.estado === 'APROBADO' && (
                      <Button size="sm" variant="secondary" leftIcon={<RotateCcw className="h-4 w-4" />} onClick={() => mover(t.id, 'PENDIENTE')} disabled={cambiarEstado.isPending}>
                        Quitar de la web
                      </Button>
                    )}
                    <Button size="sm" variant="ghost" leftIcon={<Pencil className="h-4 w-4" />} onClick={() => setEditando(t)}>Editar</Button>
                    <Button size="sm" variant="ghost" leftIcon={<Trash2 className="h-4 w-4 text-red-600" />} onClick={() => setEliminarId(t.id)}>
                      <span className="text-red-600">Eliminar</span>
                    </Button>
                  </div>
                </article>
              );
            })}
          </div>
          <Pagination pagination={pagination} onPageChange={setPage} onLimitChange={setLimit} />
        </>
      )}

      {editando && <EditarModal testimonio={editando} onClose={() => setEditando(null)} />}

      <ConfirmDialog
        isOpen={!!eliminarId}
        title="Eliminar testimonio"
        message="Se eliminará definitivamente. Si solo quieres que no se vea en la web, usa “Quitar de la web” o “Rechazar”."
        onConfirm={() => { eliminar.mutate(eliminarId); setEliminarId(null); }}
        onCancel={() => setEliminarId(null)}
        loading={eliminar.isPending}
      />
    </div>
  );
}
