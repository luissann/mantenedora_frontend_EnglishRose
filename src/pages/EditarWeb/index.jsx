import { useEffect, useMemo, useState } from 'react';
import { Navigate, useBlocker, useNavigate, useParams } from 'react-router-dom';
import { ExternalLink, Save, Undo2, RotateCcw, AlertTriangle, CircleCheck, Info } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '../../components/shared/PageHeader';
import { ConfirmDialog } from '../../components/shared/ConfirmDialog';
import { Button } from '../../components/ui/Button';
import { Spinner } from '../../components/ui/Spinner';
import { formatDateTime } from '../../utils/formatters';
import { useSitio, useGuardarSitio, useRestaurarSitio } from '../../hooks/useSitio';
import { SECCIONES, validarSeccion } from './schemas';
import { FormularioSeccion, conIds, sinIds } from './campos';

const SITIO_URL = import.meta.env.VITE_SITIO_URL || 'https://englishroseacademy.cl';

// JSON con las llaves ordenadas: compara contenido sin depender del orden de los campos.
const estable = (v) => JSON.stringify(v, (_k, x) => (x && typeof x === 'object' && !Array.isArray(x)
  ? Object.keys(x).sort().reduce((o, k) => { o[k] = x[k]; return o; }, {})
  : x));

function VistaGoogle({ valor }) {
  const titulo = (valor?.title || '').slice(0, 60) || 'Título de la página';
  const desc = (valor?.description || '').slice(0, 160) || 'La descripción aparecerá acá.';
  return (
    <div className="rounded-2xl border border-border bg-white p-4">
      <p className="mb-2 text-xs font-medium uppercase tracking-wide text-text-secondary">Así se vería en Google</p>
      <p className="text-xs text-slate-600">englishroseacademy.cl</p>
      <p className="mt-0.5 text-lg leading-snug text-[#1a0dab]">{titulo}</p>
      <p className="mt-0.5 text-sm text-slate-600">{desc}</p>
    </div>
  );
}

export default function EditarWebPage() {
  const { seccion: param } = useParams();
  const navigate = useNavigate();
  const { data: resp, isLoading, isError, refetch } = useSitio();
  const guardar = useGuardarSitio();
  const restaurar = useRestaurarSitio();

  const [drafts, setDrafts] = useState({});          // cambios sin guardar, por sección
  const [intentado, setIntentado] = useState({});    // se intentó guardar: mostrar errores en vivo
  const [erroresServidor, setErroresServidor] = useState({});
  const [confirmar, setConfirmar] = useState(null);  // 'restaurar' | 'descartar'

  const secciones = resp?.data || [];
  const def = SECCIONES.find((s) => s.clave === param);
  const servidor = secciones.find((s) => s.clave === param);

  // Al abrir una sección, se arma su borrador a partir de lo que hay guardado.
  useEffect(() => {
    if (def && servidor && drafts[def.clave] === undefined) {
      setDrafts((d) => ({ ...d, [def.clave]: conIds(servidor.valor) }));
    }
  }, [def, servidor, drafts]);

  const sucio = (clave) => {
    const s = secciones.find((x) => x.clave === clave);
    return drafts[clave] !== undefined && !!s && estable(sinIds(drafts[clave])) !== estable(s.valor);
  };
  const clavesSucias = useMemo(() => SECCIONES.filter((s) => sucio(s.clave)).map((s) => s.clave), [drafts, secciones]); // eslint-disable-line react-hooks/exhaustive-deps
  const hayCambios = clavesSucias.length > 0;

  // Avisar antes de perder cambios: al navegar a otra pantalla y al cerrar la pestaña.
  const bloqueo = useBlocker(({ nextLocation }) => hayCambios && !nextLocation.pathname.startsWith('/editar-web'));
  useEffect(() => {
    if (!hayCambios) return undefined;
    const aviso = (e) => { e.preventDefault(); e.returnValue = ''; };
    window.addEventListener('beforeunload', aviso);
    return () => window.removeEventListener('beforeunload', aviso);
  }, [hayCambios]);

  if (!param) return <Navigate to="/editar-web/hero" replace />;
  if (!def) return <Navigate to="/editar-web/hero" replace />;

  const draft = drafts[def.clave];
  const erroresCliente = intentado[def.clave] && draft !== undefined ? validarSeccion(def, sinIds(draft)) : {};
  const nErrores = Object.keys(erroresCliente).length;
  const cambiado = sucio(def.clave);
  const setDraft = (v) => setDrafts((d) => ({ ...d, [def.clave]: v }));

  const alGuardar = () => {
    const valor = sinIds(draft);
    const errs = validarSeccion(def, valor);
    setIntentado((i) => ({ ...i, [def.clave]: true }));
    setErroresServidor((e) => ({ ...e, [def.clave]: [] }));
    if (Object.keys(errs).length) { toast.error('Revisa los campos marcados en rojo'); return; }
    guardar.mutate({ clave: def.clave, valor }, {
      onSuccess: (r) => {
        setDrafts((d) => ({ ...d, [def.clave]: conIds(r.data.valor) }));
        setIntentado((i) => ({ ...i, [def.clave]: false }));
      },
      onError: (e) => setErroresServidor((x) => ({ ...x, [def.clave]: e.response?.data?.errors || [] })),
    });
  };

  const alRestaurar = () => {
    restaurar.mutate({ clave: def.clave }, {
      onSuccess: (r) => {
        setDrafts((d) => ({ ...d, [def.clave]: conIds(r.data.valor) }));
        setIntentado((i) => ({ ...i, [def.clave]: false }));
        setErroresServidor((x) => ({ ...x, [def.clave]: [] }));
      },
    });
    setConfirmar(null);
  };

  const alDescartar = () => {
    setDrafts((d) => ({ ...d, [def.clave]: conIds(servidor.valor) }));
    setIntentado((i) => ({ ...i, [def.clave]: false }));
    setErroresServidor((x) => ({ ...x, [def.clave]: [] }));
    setConfirmar(null);
  };

  const Icono = def.icon;
  const errSrv = erroresServidor[def.clave] || [];

  return (
    <div className="space-y-6">
      <PageHeader title="Editar web" />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="max-w-2xl text-sm text-text-secondary">
          Cambia los textos de la página pública. Al <strong>guardar y publicar</strong> se actualiza la web (se ve en cerca de 1 minuto).
        </p>
        <a href={SITIO_URL} target="_blank" rel="noopener noreferrer">
          <Button variant="secondary" size="sm" leftIcon={<ExternalLink className="h-4 w-4" />}>Ver sitio</Button>
        </a>
      </div>

      {isLoading ? (
        <div className="flex h-72 items-center justify-center"><Spinner size="lg" /></div>
      ) : isError ? (
        <div className="rounded-3xl border border-border bg-white p-10 text-center">
          <p className="text-lg font-semibold text-text-primary">No se pudo cargar el contenido de la web</p>
          <p className="mt-1 text-sm text-text-secondary">Revisa tu conexión e inténtalo de nuevo.</p>
          <Button className="mt-4" onClick={() => refetch()}>Reintentar</Button>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[250px_minmax(0,1fr)]">
          {/* Lista de secciones: columna en escritorio, selector en móvil */}
          <nav aria-label="Secciones de la web">
            <select
              value={def.clave}
              onChange={(e) => navigate(`/editar-web/${e.target.value}`)}
              className="w-full rounded-2xl border border-border-input bg-white px-4 py-3 text-sm lg:hidden"
            >
              {SECCIONES.map((s) => <option key={s.clave} value={s.clave}>{s.titulo}{clavesSucias.includes(s.clave) ? '  •  sin guardar' : ''}</option>)}
            </select>
            <ul className="sticky top-20 hidden space-y-1 rounded-3xl border border-border bg-white p-3 lg:block">
              {SECCIONES.map((s) => {
                const activa = s.clave === def.clave;
                const info = secciones.find((x) => x.clave === s.clave);
                const I = s.icon;
                return (
                  <li key={s.clave}>
                    <button type="button" onClick={() => navigate(`/editar-web/${s.clave}`)}
                      className={`flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left text-sm font-medium transition ${activa ? 'bg-rose-light text-rose' : 'text-text-secondary hover:bg-rose-light/60'}`}>
                      <I className="h-4 w-4 shrink-0" />
                      <span className="flex-1 truncate">{s.titulo}</span>
                      {clavesSucias.includes(s.clave)
                        ? <span className="h-2.5 w-2.5 rounded-full bg-amber-500" title="Cambios sin guardar" />
                        : info?.personalizado ? <span className="h-2 w-2 rounded-full bg-rose/60" title="Personalizada" /> : null}
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Editor de la sección */}
          <section className="min-w-0 space-y-5">
            <div className="rounded-3xl border border-border bg-white p-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-rose-light text-rose"><Icono className="h-5 w-5" /></span>
                  <div>
                    <h2 className="font-playfair text-2xl text-text-primary">{def.titulo}</h2>
                    <p className="text-sm text-text-secondary">Se ve en: {def.donde}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1 text-xs text-text-secondary">
                  {servidor?.personalizado
                    ? <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 font-semibold text-green-800"><CircleCheck className="h-3.5 w-3.5" />Personalizada</span>
                    : <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 font-semibold text-slate-700">Contenido original</span>}
                  {servidor?.actualizado_en && <span>Última edición: {formatDateTime(servidor.actualizado_en)}{servidor.actualizado_por ? ` · ${servidor.actualizado_por}` : ''}</span>}
                </div>
              </div>
              {def.ayuda && (
                <p className="mt-4 flex items-start gap-2 rounded-2xl bg-rose-light/50 px-4 py-3 text-sm text-text-primary"><Info className="mt-0.5 h-4 w-4 shrink-0 text-rose" />{def.ayuda}</p>
              )}
            </div>

            {errSrv.length > 0 && (
              <div className="flex items-start gap-3 rounded-2xl border border-red-300 bg-red-50 p-4 text-sm text-red-800">
                <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
                <div>
                  <p className="font-semibold">No se pudo guardar. Corrige esto y vuelve a intentar:</p>
                  <ul className="mt-1 list-disc space-y-0.5 pl-4">{errSrv.map((m, i) => <li key={i}>{typeof m === 'string' ? m : m.mensaje || JSON.stringify(m)}</li>)}</ul>
                </div>
              </div>
            )}
            {nErrores > 0 && (
              <div className="flex items-start gap-3 rounded-2xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-800">
                <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
                <p><strong>{nErrores} {nErrores === 1 ? 'campo necesita' : 'campos necesitan'} revisión.</strong> Están marcados en rojo (las listas con errores se abren solas).</p>
              </div>
            )}

            <div className="rounded-3xl border border-border bg-white p-6">
              {draft === undefined
                ? <div className="flex h-40 items-center justify-center"><Spinner /></div>
                : <FormularioSeccion seccion={def} valor={draft} onChange={setDraft} errores={erroresCliente} />}
            </div>

            {def.extra === 'seo' && draft && <VistaGoogle valor={draft} />}

            {/* Barra de acciones */}
            <div className="sticky bottom-4 z-10 flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-border bg-white/95 p-4 shadow-lg backdrop-blur">
              <div className="text-sm">
                {cambiado
                  ? <span className="inline-flex items-center gap-2 font-medium text-amber-700"><span className="h-2.5 w-2.5 rounded-full bg-amber-500" />Tienes cambios sin guardar</span>
                  : <span className="text-text-secondary">Sin cambios pendientes</span>}
              </div>
              <div className="flex flex-wrap gap-2">
                {servidor?.personalizado && (
                  <Button variant="ghost" size="sm" leftIcon={<RotateCcw className="h-4 w-4" />} onClick={() => setConfirmar('restaurar')} disabled={restaurar.isPending}>Restaurar original</Button>
                )}
                {cambiado && (
                  <Button variant="secondary" size="sm" leftIcon={<Undo2 className="h-4 w-4" />} onClick={() => setConfirmar('descartar')}>Descartar cambios</Button>
                )}
                <Button leftIcon={<Save className="h-4 w-4" />} onClick={alGuardar} loading={guardar.isPending} disabled={!cambiado}>Guardar y publicar</Button>
              </div>
            </div>
          </section>
        </div>
      )}

      <ConfirmDialog
        isOpen={confirmar === 'restaurar'}
        title="Restaurar contenido original"
        message="Se borrará lo que personalizaste en esta sección y la web volverá a mostrar el texto original. Esto se publica de inmediato."
        onConfirm={alRestaurar}
        onCancel={() => setConfirmar(null)}
        loading={restaurar.isPending}
      />
      <ConfirmDialog
        isOpen={confirmar === 'descartar'}
        title="Descartar cambios"
        message="Se perderán los cambios que no has guardado en esta sección."
        onConfirm={alDescartar}
        onCancel={() => setConfirmar(null)}
      />
      <ConfirmDialog
        isOpen={bloqueo.state === 'blocked'}
        title="Hay cambios sin guardar"
        message="Si sales ahora, perderás lo que editaste en Editar web. ¿Quieres salir igualmente?"
        onConfirm={() => bloqueo.proceed()}
        onCancel={() => bloqueo.reset()}
      />
    </div>
  );
}
