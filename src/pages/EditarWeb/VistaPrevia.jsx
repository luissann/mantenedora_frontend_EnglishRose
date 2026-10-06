import { useEffect, useMemo, useRef, useState } from 'react';
import { Monitor, Smartphone, RefreshCw, X, ExternalLink, TriangleAlert, LoaderCircle } from 'lucide-react';

const SITIO_URL = (import.meta.env.VITE_SITIO_URL || 'https://englishroseacademy.cl').replace(/\/$/, '');
const ORIGEN_SITIO = new URL(SITIO_URL).origin;
const ANCHO_ESCRITORIO = 1280;
const ANCHO_MOVIL = 390;

// Vista previa de la web real dentro de la mantenedora. La landing se abre con ?preview=1 y,
// al cargar, avisa que está lista; entonces se le manda el contenido SIN GUARDAR (postMessage).
// Cada cambio (con una pausa de ~0,7 s) le pide recargarse, y vuelve a la misma posición.
export default function VistaPrevia({ pagina, ancla, contenido, onCerrar, flotante = false }) {
  const iframeRef = useRef(null);
  const cajaRef = useRef(null);
  const ventanaExtra = useRef(null);
  const [dispositivo, setDispositivo] = useState('escritorio');
  const [cargando, setCargando] = useState(true);
  const [fallo, setFallo] = useState(false);
  const [medida, setMedida] = useState({ ancho: 600, alto: 600 });

  const contenidoRef = useRef(contenido);
  contenidoRef.current = contenido;
  const firma = useMemo(() => JSON.stringify(contenido), [contenido]);
  const src = `${SITIO_URL}/${pagina}?preview=1${ancla ? `#${ancla}` : ''}`;

  // Tamaño disponible, para escalar la página de escritorio al ancho del panel.
  useEffect(() => {
    const el = cajaRef.current;
    if (!el) return undefined;
    const ro = new ResizeObserver(([e]) => setMedida({ ancho: e.contentRect.width, alto: e.contentRect.height }));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const destinos = () => [iframeRef.current?.contentWindow, ventanaExtra.current].filter((w) => w && !w.closed);

  // La landing avisa que está lista → se le manda el contenido actual.
  useEffect(() => {
    const alMensaje = (e) => {
      if (e.origin !== ORIGEN_SITIO) return;
      if (e.source !== iframeRef.current?.contentWindow && e.source !== ventanaExtra.current) return;
      if (e.data?.tipo === 'era-preview-listo') {
        e.source.postMessage({ tipo: 'era-preview-contenido', secciones: contenidoRef.current }, ORIGEN_SITIO);
        setCargando(false); setFallo(false);
      }
    };
    window.addEventListener('message', alMensaje);
    return () => window.removeEventListener('message', alMensaje);
  }, []);

  // Cambió el contenido → se pide recargar (con pausa para no recargar en cada tecla).
  const firmaAnterior = useRef(firma);
  useEffect(() => {
    if (firmaAnterior.current === firma) return undefined;
    firmaAnterior.current = firma;
    const t = setTimeout(() => {
      setCargando(true);
      destinos().forEach((w) => w.postMessage({ tipo: 'era-preview-recargar' }, ORIGEN_SITIO));
    }, 700);
    return () => clearTimeout(t);
  }, [firma]); // eslint-disable-line react-hooks/exhaustive-deps

  // Si la página cambia o tarda demasiado en avisar, se muestra una ayuda.
  useEffect(() => {
    setCargando(true); setFallo(false);
    const t = setTimeout(() => setFallo(true), 9000);
    return () => clearTimeout(t);
  }, [src]);
  useEffect(() => {
    if (!cargando) return undefined;
    const t = setTimeout(() => setFallo(true), 9000);
    return () => clearTimeout(t);
  }, [cargando]);

  const recargarManual = () => { setCargando(true); setFallo(false); destinos().forEach((w) => w.postMessage({ tipo: 'era-preview-recargar' }, ORIGEN_SITIO)); };
  const abrirAparte = () => { ventanaExtra.current = window.open(src, 'era-previa'); };

  const escritorio = dispositivo === 'escritorio';
  const escala = escritorio ? Math.min(1, medida.ancho / ANCHO_ESCRITORIO) : Math.min(1, medida.ancho / ANCHO_MOVIL);
  const anchoMarco = escritorio ? ANCHO_ESCRITORIO : ANCHO_MOVIL;
  const altoMarco = medida.alto / escala;

  const BTN = 'inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-semibold text-text-secondary transition hover:bg-rose-light hover:text-rose';
  const caja = (
    <div className={`flex min-h-0 flex-col overflow-hidden bg-white ${flotante ? 'h-full' : 'h-[calc(100vh-7rem)] rounded-3xl border border-border shadow-sm'}`}>
      <div className="flex flex-wrap items-center gap-2 border-b border-border px-4 py-3">
        <div className="mr-auto">
          <p className="text-sm font-semibold text-text-primary">Vista previa</p>
          <p className="text-xs text-text-secondary">Muestra tus cambios sin guardar. Se actualiza al dejar de escribir.</p>
        </div>
        <span className="inline-flex overflow-hidden rounded-full border border-border text-xs">
          <button type="button" onClick={() => setDispositivo('escritorio')} aria-pressed={escritorio} className={`inline-flex items-center gap-1.5 px-3 py-1.5 font-semibold ${escritorio ? 'bg-rose-light text-rose' : 'text-text-secondary hover:bg-rose-light/60'}`}><Monitor className="h-3.5 w-3.5" />Escritorio</button>
          <button type="button" onClick={() => setDispositivo('movil')} aria-pressed={!escritorio} className={`inline-flex items-center gap-1.5 px-3 py-1.5 font-semibold ${!escritorio ? 'bg-rose-light text-rose' : 'text-text-secondary hover:bg-rose-light/60'}`}><Smartphone className="h-3.5 w-3.5" />Celular</button>
        </span>
        <button type="button" onClick={recargarManual} className={BTN} title="Volver a cargar"><RefreshCw className={`h-3.5 w-3.5 ${cargando ? 'animate-spin' : ''}`} />Recargar</button>
        <button type="button" onClick={abrirAparte} className={BTN} title="Abrir en otra pestaña"><ExternalLink className="h-3.5 w-3.5" />Pestaña nueva</button>
        {onCerrar && <button type="button" onClick={onCerrar} className={BTN} aria-label="Cerrar vista previa"><X className="h-3.5 w-3.5" />Cerrar</button>}
      </div>

      <div ref={cajaRef} className="relative min-h-0 flex-1 overflow-hidden bg-slate-100">
        <div
          className={escritorio ? '' : 'mx-auto'}
          style={{ width: anchoMarco * escala, height: medida.alto }}
        >
          <iframe
            ref={iframeRef}
            key={src}
            src={src}
            title="Vista previa de la web"
            style={{ width: anchoMarco, height: altoMarco, transform: `scale(${escala})`, transformOrigin: 'top left', border: 0, background: '#fff' }}
          />
        </div>

        {cargando && !fallo && (
          <div className="pointer-events-none absolute right-3 top-3 inline-flex items-center gap-2 rounded-full bg-white/95 px-3 py-1.5 text-xs font-medium text-text-secondary shadow">
            <LoaderCircle className="h-3.5 w-3.5 animate-spin" /> Actualizando…
          </div>
        )}
        {fallo && cargando && (
          <div className="absolute inset-x-4 bottom-4 flex items-start gap-3 rounded-2xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900 shadow-lg">
            <TriangleAlert className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
            <div>
              <p className="font-semibold">No se pudo cargar la vista previa dentro de esta pantalla.</p>
              <p className="mt-0.5">Puede que la web no permita mostrarse aquí. Prueba con <button type="button" onClick={abrirAparte} className="font-semibold underline">abrirla en una pestaña nueva</button>: también se actualizará con tus cambios.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return flotante ? <div className="fixed inset-0 z-50 flex flex-col bg-white">{caja}</div> : caja;
}
