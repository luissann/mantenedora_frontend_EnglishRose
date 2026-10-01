import { useRef, useState } from 'react';
import { ChevronDown, ChevronUp, Plus, Trash2, Bold, Italic, List, Link as LinkIcon, AlertCircle } from 'lucide-react';
import { sanitizeHtml } from '../../utils/sanitizeHtml';

const INPUT = 'w-full rounded-2xl border bg-white px-4 py-3 text-sm outline-none transition focus:border-rose focus:ring-2 focus:ring-rose/20';
const borde = (error) => (error ? 'border-red-400' : 'border-border-input');

// ── ids estables para los ítems de las listas (para reordenar sin perder el estado abierto/cerrado) ──
let contador = 0;
const nuevoId = () => `k${++contador}`;
export function conIds(valor) {
  if (Array.isArray(valor)) return valor.map((v) => (v && typeof v === 'object' && !Array.isArray(v) ? { ...conIdsObj(v), _k: nuevoId() } : v));
  if (valor && typeof valor === 'object') return conIdsObj(valor);
  return valor;
}
function conIdsObj(o) {
  const salida = {};
  for (const [k, v] of Object.entries(o)) salida[k] = Array.isArray(v) ? conIds(v) : v;
  return salida;
}
export function sinIds(valor) {
  if (Array.isArray(valor)) return valor.map(sinIds);
  if (valor && typeof valor === 'object') {
    const salida = {};
    for (const [k, v] of Object.entries(valor)) if (k !== '_k') salida[k] = sinIds(v);
    return salida;
  }
  return valor;
}

// ── marco común: etiqueta, ayuda, contador y error ──
export function Campo({ label, ayuda, error, max, largo = 0, recomendado, children }) {
  const pasado = max && largo > max;
  const aviso = !pasado && ((recomendado && largo > recomendado) || (max && largo > max * 0.9));
  return (
    <div>
      <div className="flex items-end justify-between gap-3">
        <label className="text-sm font-medium text-text-primary">{label}</label>
        {max ? (
          <span className={`text-xs tabular-nums ${pasado ? 'font-semibold text-red-600' : aviso ? 'text-amber-600' : 'text-text-secondary'}`}>
            {largo}/{recomendado || max}
          </span>
        ) : null}
      </div>
      <div className="mt-2">{children}</div>
      {error ? (
        <p className="mt-1.5 flex items-center gap-1.5 text-xs text-red-600"><AlertCircle className="h-3.5 w-3.5 shrink-0" />{error}</p>
      ) : ayuda ? (
        <p className="mt-1.5 text-xs text-text-secondary">{ayuda}</p>
      ) : null}
    </div>
  );
}

function Texto({ campo, valor, onChange, error }) {
  const modo = campo.tipo === 'whatsapp' ? { inputMode: 'numeric', placeholder: '56912345678' }
    : campo.tipo === 'email' ? { type: 'email', placeholder: 'correo@dominio.cl' }
    : ['url', 'link', 'imagen'].includes(campo.tipo) ? { placeholder: campo.tipo === 'imagen' ? 'img/foto.jpg' : campo.tipo === 'link' ? 'contact.html' : 'https://…' }
    : {};
  return (
    <Campo label={campo.label} ayuda={campo.ayuda} error={error} max={campo.max} largo={String(valor ?? '').length} recomendado={campo.recomendado}>
      <input type="text" value={valor ?? ''} onChange={(e) => onChange(e.target.value)} className={`${INPUT} ${borde(error)}`} {...modo} />
    </Campo>
  );
}

function Area({ campo, valor, onChange, error }) {
  return (
    <Campo label={campo.label} ayuda={campo.ayuda} error={error} max={campo.max} largo={String(valor ?? '').length} recomendado={campo.recomendado}>
      <textarea value={valor ?? ''} onChange={(e) => onChange(e.target.value)} rows={campo.rows || 3} className={`${INPUT} ${borde(error)}`} />
    </Campo>
  );
}

const EMOJIS = ['⭐', '✨', '📚', '🎯', '💬', '🗣️', '🎤', '✈️', '🏫', '📖', '📝', '💻', '🤝', '🧠', '🔄', '📈', '👥', '💰', '⏰', '🌎', '🌹', '❤️'];
function Emoji({ campo, valor, onChange, error }) {
  return (
    <Campo label={campo.label} ayuda={campo.ayuda || 'Pega un emoji o elige uno.'} error={error}>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <input type="text" value={valor ?? ''} onChange={(e) => onChange(e.target.value)} maxLength={8} className={`${INPUT} ${borde(error)} sm:w-24 text-center text-lg`} />
        <div className="flex flex-wrap gap-1">
          {EMOJIS.map((e) => (
            <button key={e} type="button" onClick={() => onChange(e)} className={`h-8 w-8 rounded-lg text-base transition hover:bg-rose-light ${valor === e ? 'bg-rose-light ring-1 ring-rose' : ''}`} aria-label={`Usar ${e}`}>{e}</button>
          ))}
        </div>
      </div>
    </Campo>
  );
}

// ── texto con formato: negrita, cursiva, lista, enlace, salto de línea + vista previa ──
function Html({ campo, valor, onChange, error }) {
  const ref = useRef(null);
  const [modo, setModo] = useState('editar');
  const v = valor ?? '';

  const envolver = (abre, cierra) => {
    const el = ref.current; if (!el) return;
    const [a, b] = [el.selectionStart, el.selectionEnd];
    const sel = v.slice(a, b) || 'texto';
    onChange(v.slice(0, a) + abre + sel + cierra + v.slice(b));
    requestAnimationFrame(() => { el.focus(); el.setSelectionRange(a + abre.length, a + abre.length + sel.length); });
  };
  const enlace = () => {
    const url = window.prompt('Dirección del enlace (https://… o una página de la web, ej. contact.html)');
    if (url) envolver(`<a href="${url.replace(/"/g, '')}">`, '</a>');
  };
  const BTN = 'inline-flex items-center gap-1 rounded-lg border border-border px-2.5 py-1.5 text-xs font-medium text-text-secondary transition hover:bg-rose-light hover:text-rose';

  return (
    <Campo label={campo.label} ayuda={campo.ayuda} error={error} max={campo.max} largo={v.length}>
      <div className="mb-2 flex flex-wrap items-center gap-1.5">
        <button type="button" className={BTN} onClick={() => envolver('<strong>', '</strong>')}><Bold className="h-3.5 w-3.5" />Negrita</button>
        <button type="button" className={BTN} onClick={() => envolver('<em>', '</em>')}><Italic className="h-3.5 w-3.5" />Cursiva</button>
        <button type="button" className={BTN} onClick={() => envolver('<ul><li>', '</li></ul>')}><List className="h-3.5 w-3.5" />Lista</button>
        <button type="button" className={BTN} onClick={enlace}><LinkIcon className="h-3.5 w-3.5" />Enlace</button>
        <button type="button" className={BTN} onClick={() => envolver('', '<br>')}>Salto de línea</button>
        <span className="ml-auto inline-flex overflow-hidden rounded-lg border border-border text-xs">
          {['editar', 'vista previa'].map((m) => (
            <button key={m} type="button" onClick={() => setModo(m)} className={`px-3 py-1.5 font-medium capitalize ${modo === m ? 'bg-rose-light text-rose' : 'text-text-secondary hover:bg-rose-light/60'}`}>{m}</button>
          ))}
        </span>
      </div>
      {modo === 'editar' ? (
        <textarea ref={ref} value={v} onChange={(e) => onChange(e.target.value)} rows={campo.rows || 6} className={`${INPUT} ${borde(error)} font-mono text-[13px] leading-relaxed`} spellCheck />
      ) : (
        <div className="prose-preview min-h-[8rem] rounded-2xl border border-border bg-cream/40 p-4 text-sm leading-relaxed text-text-primary [&_a]:text-rose [&_a]:underline [&_li]:ml-5 [&_li]:list-disc [&_p]:mb-2 [&_ul]:my-2" dangerouslySetInnerHTML={{ __html: sanitizeHtml(v) || '<span style="opacity:.5">Sin contenido</span>' }} />
      )}
    </Campo>
  );
}

function Interruptor({ campo, valor, onChange }) {
  const on = !!valor;
  return (
    <div className="flex items-center justify-between rounded-2xl border border-border bg-white px-4 py-3">
      <span className="text-sm font-medium text-text-primary">{campo.label}</span>
      <button type="button" role="switch" aria-checked={on} onClick={() => onChange(!on)}
        className={`relative h-6 w-11 rounded-full transition ${on ? 'bg-rose' : 'bg-slate-300'}`}>
        <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${on ? 'left-[22px]' : 'left-0.5'}`} />
        <span className="sr-only">{on ? 'Visible' : 'Oculto'}</span>
      </button>
    </div>
  );
}

// ── lista de textos sueltos ──
function Textos({ campo, valor, onChange, errores, ruta }) {
  const lista = Array.isArray(valor) ? valor : [];
  const mover = (i, d) => { const j = i + d; if (j < 0 || j >= lista.length) return; const c = [...lista]; [c[i], c[j]] = [c[j], c[i]]; onChange(c); };
  return (
    <Campo label={campo.label} ayuda={campo.ayuda}>
      <div className="space-y-2">
        {lista.map((txt, i) => (
          <div key={i} className="flex items-center gap-2">
            <input type="text" value={txt} onChange={(e) => onChange(lista.map((x, j) => (j === i ? e.target.value : x)))} className={`${INPUT} ${borde(errores[`${ruta}.${i}`])}`} />
            <button type="button" onClick={() => mover(i, -1)} disabled={i === 0} className="rounded-lg p-2 text-text-secondary hover:bg-rose-light disabled:opacity-30" aria-label="Subir"><ChevronUp className="h-4 w-4" /></button>
            <button type="button" onClick={() => mover(i, 1)} disabled={i === lista.length - 1} className="rounded-lg p-2 text-text-secondary hover:bg-rose-light disabled:opacity-30" aria-label="Bajar"><ChevronDown className="h-4 w-4" /></button>
            <button type="button" onClick={() => onChange(lista.filter((_, j) => j !== i))} className="rounded-lg p-2 text-red-500 hover:bg-red-50" aria-label="Quitar"><Trash2 className="h-4 w-4" /></button>
          </div>
        ))}
        {(!campo.max || lista.length < campo.max) && (
          <button type="button" onClick={() => onChange([...lista, ''])} className="inline-flex items-center gap-1.5 rounded-full border border-dashed border-rose/50 px-4 py-2 text-sm font-medium text-rose transition hover:bg-rose-light">
            <Plus className="h-4 w-4" /> Agregar
          </button>
        )}
      </div>
    </Campo>
  );
}

// ── lista de elementos con varios campos: reordenar, abrir/cerrar, quitar ──
function Lista({ campo, valor, onChange, errores, ruta }) {
  const items = Array.isArray(valor) ? valor : [];
  const [abiertos, setAbiertos] = useState(() => new Set());
  const [quitar, setQuitar] = useState(null);

  const alternar = (k) => setAbiertos((s) => { const n = new Set(s); n.has(k) ? n.delete(k) : n.add(k); return n; });
  const mover = (i, d) => { const j = i + d; if (j < 0 || j >= items.length) return; const c = [...items]; [c[i], c[j]] = [c[j], c[i]]; onChange(c); };
  const agregar = () => { const it = { ...conIdsObj(campo.nuevo()), _k: nuevoId() }; onChange([...items, it]); setAbiertos((s) => new Set(s).add(it._k)); };
  const tieneError = (i) => Object.keys(errores).some((k) => k.startsWith(`${ruta}.${i}.`));

  return (
    <div className="space-y-3">
      {campo.tipo === 'lista' && (
        <div className="flex items-end justify-between">
          <div>
            <p className="text-sm font-medium text-text-primary">{campo.label}</p>
            {campo.ayuda && <p className="text-xs text-text-secondary">{campo.ayuda}</p>}
          </div>
          <span className="text-xs text-text-secondary">{items.length}{campo.max ? `/${campo.max}` : ''}</span>
        </div>
      )}
      {items.length === 0 && <p className="rounded-2xl border border-dashed border-border p-4 text-center text-sm text-text-secondary">Todavía no hay elementos.</p>}
      {items.map((it, i) => {
        const abierto = abiertos.has(it._k) || tieneError(i);
        return (
          <div key={it._k || i} className={`rounded-2xl border bg-white ${tieneError(i) ? 'border-red-300' : 'border-border'}`}>
            <div className="flex items-center gap-2 px-3 py-2">
              <button type="button" onClick={() => alternar(it._k)} className="flex min-w-0 flex-1 items-center gap-2 rounded-xl px-2 py-2 text-left hover:bg-rose-light/50" aria-expanded={abierto}>
                <ChevronDown className={`h-4 w-4 shrink-0 text-text-secondary transition ${abierto ? 'rotate-180' : ''}`} />
                <span className="truncate text-sm font-medium text-text-primary">{campo.titulo ? campo.titulo(it, i) : `Elemento ${i + 1}`}</span>
                {tieneError(i) && <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />}
              </button>
              <button type="button" onClick={() => mover(i, -1)} disabled={i === 0} className="rounded-lg p-2 text-text-secondary hover:bg-rose-light disabled:opacity-30" aria-label="Subir"><ChevronUp className="h-4 w-4" /></button>
              <button type="button" onClick={() => mover(i, 1)} disabled={i === items.length - 1} className="rounded-lg p-2 text-text-secondary hover:bg-rose-light disabled:opacity-30" aria-label="Bajar"><ChevronDown className="h-4 w-4" /></button>
              <button type="button" onClick={() => setQuitar(i)} className="rounded-lg p-2 text-red-500 hover:bg-red-50" aria-label="Quitar"><Trash2 className="h-4 w-4" /></button>
            </div>
            {quitar === i && (
              <div className="mx-3 mb-3 flex flex-wrap items-center justify-between gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
                <span>¿Quitar este elemento? Se publica recién al guardar.</span>
                <span className="flex gap-2">
                  <button type="button" onClick={() => setQuitar(null)} className="rounded-full border border-red-200 bg-white px-3 py-1 text-xs font-semibold">Cancelar</button>
                  <button type="button" onClick={() => { onChange(items.filter((_, j) => j !== i)); setQuitar(null); }} className="rounded-full bg-red-600 px-3 py-1 text-xs font-semibold text-white">Quitar</button>
                </span>
              </div>
            )}
            {abierto && (
              <div className="space-y-4 border-t border-border px-4 py-4">
                {campo.campos.map((c) => (
                  <Renderizar key={c.k} campo={c} valor={it[c.k]} ruta={`${ruta}.${i}.${c.k}`} errores={errores}
                    onChange={(v) => onChange(items.map((x, j) => (j === i ? { ...x, [c.k]: v } : x)))} />
                ))}
              </div>
            )}
          </div>
        );
      })}
      {(!campo.max || items.length < campo.max) && (
        <button type="button" onClick={agregar} className="inline-flex items-center gap-1.5 rounded-full border border-dashed border-rose/50 px-4 py-2 text-sm font-medium text-rose transition hover:bg-rose-light">
          <Plus className="h-4 w-4" /> Agregar
        </button>
      )}
    </div>
  );
}

// Elige el componente según el tipo del campo.
export function Renderizar({ campo, valor, onChange, errores, ruta }) {
  const error = errores[ruta];
  switch (campo.tipo) {
    case 'area': return <Area campo={campo} valor={valor} onChange={onChange} error={error} />;
    case 'html': return <Html campo={campo} valor={valor} onChange={onChange} error={error} />;
    case 'emoji': return <Emoji campo={campo} valor={valor} onChange={onChange} error={error} />;
    case 'interruptor': return <Interruptor campo={campo} valor={valor} onChange={onChange} />;
    case 'textos': return <Textos campo={campo} valor={valor} onChange={onChange} errores={errores} ruta={ruta} />;
    case 'lista':
    case 'lista-raiz': return <Lista campo={campo} valor={valor} onChange={onChange} errores={errores} ruta={ruta} />;
    default: return <Texto campo={campo} valor={valor} onChange={onChange} error={error} />;
  }
}

// Formulario completo de una sección.
export function FormularioSeccion({ seccion, valor, onChange, errores }) {
  if (seccion.campos[0]?.tipo === 'lista-raiz') {
    return <Renderizar campo={seccion.campos[0]} valor={valor} ruta="_lista" errores={errores} onChange={onChange} />;
  }
  const v = valor || {};
  const interruptores = seccion.campos.every((c) => c.tipo === 'interruptor');
  return (
    <div className={interruptores ? 'grid gap-3 sm:grid-cols-2' : 'space-y-5'}>
      {seccion.campos.map((c) => (
        <Renderizar key={c.k} campo={c} valor={v[c.k]} ruta={c.k} errores={errores} onChange={(nv) => onChange({ ...v, [c.k]: nv })} />
      ))}
    </div>
  );
}
