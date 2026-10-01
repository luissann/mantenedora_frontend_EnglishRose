// Definición de las secciones editables de la web ("Editar web").
// Cada sección dice dónde se ve, y sus campos (con límites y formatos que coinciden con la
// validación del backend: Backend/src/config/contenidoSitioSchema.js).
import {
  House, Sparkles, Layers, Gift, ListOrdered, Megaphone, UserRound, BookOpen,
  CircleHelp, Phone, Search, PanelBottom, Eye,
} from 'lucide-react';

const t = (k, label, extra = {}) => ({ k, label, tipo: 'texto', ...extra });
const area = (k, label, extra = {}) => ({ k, label, tipo: 'area', rows: 3, ...extra });

export const SECCIONES = [
  {
    clave: 'hero', icon: House, titulo: 'Inicio (portada)',
    donde: 'Página de inicio · parte superior, lo primero que se ve',
    campos: [
      t('eyebrow', 'Texto pequeño sobre el título', { max: 120, ayuda: 'Ej. “Bienvenidos a English Rose Academy®”' }),
      t('title', 'Título principal', { max: 160, req: true }),
      t('highlight', 'Parte del título que va resaltada (en rosado)', { max: 80, ayuda: 'Copia aquí exactamente una parte del título. Déjalo vacío para no resaltar nada.' }),
      area('description', 'Descripción', { max: 400, rows: 3 }),
      t('btn1', 'Texto del botón 1 (va a Servicios)', { max: 40 }),
      t('btn2', 'Texto del botón 2 (va a Contacto)', { max: 40 }),
      {
        k: 'stats', tipo: 'lista', label: 'Cifras destacadas', max: 4, ayuda: 'Se muestran debajo de los botones (máximo 4).',
        titulo: (it) => [it.number, it.label].filter(Boolean).join(' · ') || 'Cifra',
        nuevo: () => ({ number: '', label: '' }),
        campos: [t('number', 'Número o dato', { max: 20, ayuda: 'Ej. 6+  ·  100%' }), t('label', 'Descripción', { max: 60 })],
      },
      { k: 'image', tipo: 'imagen', label: 'Imagen de la portada', max: 200, ayuda: 'Ruta de una imagen que ya esté en la web (ej. img/profesorafinal.jpeg) o un enlace https://.' },
    ],
  },
  {
    clave: 'features', icon: Sparkles, titulo: 'Ventajas',
    donde: 'Página de inicio · “Las ventajas de aprender con nosotros”',
    campos: [{
      k: '_lista', tipo: 'lista-raiz', label: 'Ventajas', max: 12,
      titulo: (it) => [it.icon, it.title].filter(Boolean).join(' ') || 'Ventaja',
      nuevo: () => ({ icon: '⭐', title: '', desc: '' }),
      campos: [
        { k: 'icon', tipo: 'emoji', label: 'Ícono', max: 8 },
        t('title', 'Título', { max: 80, req: true }),
        area('desc', 'Descripción', { max: 300, rows: 3 }),
      ],
    }],
  },
  {
    clave: 'services', icon: Layers, titulo: 'Programas',
    donde: 'Inicio (tarjetas que giran), Servicios y pie de página',
    campos: [{
      k: '_lista', tipo: 'lista-raiz', label: 'Programas', max: 12,
      titulo: (it) => [it.icon, it.name].filter(Boolean).join(' ') || 'Programa',
      nuevo: () => ({ name: '', tag: '', desc: '', price: '', icon: '📘', details: '' }),
      campos: [
        t('name', 'Nombre del programa', { max: 100, req: true }),
        { k: 'icon', tipo: 'emoji', label: 'Ícono', max: 8 },
        t('tag', 'Etiqueta corta', { max: 60, ayuda: 'Ej. “Nivel A1-B1”, “Viajeros”' }),
        area('desc', 'Descripción', { max: 1200, rows: 5 }),
        t('price', 'Precio', { max: 80, ayuda: 'Ej. “Desde $15.000 x clase”' }),
        { k: 'details', tipo: 'html', label: 'Detalles (se despliegan en Servicios)', max: 4000, rows: 6 },
      ],
    }],
  },
  {
    clave: 'planes', icon: Gift, titulo: 'Planes adicionales',
    donde: 'Página Servicios · “Planes adicionales” (dupla, apoyo, fonoaudiología…)',
    ayuda: 'Aquí se cambian los precios de la dupla y del apoyo fonoaudiológico.',
    campos: [{
      k: '_lista', tipo: 'lista-raiz', label: 'Planes', max: 6,
      titulo: (it) => [it.icon, it.title].filter(Boolean).join(' ') || 'Plan',
      nuevo: () => ({ icon: '✨', title: '', description: '', prices: [{ amount: '', detail: '' }], priceNote: '', listTitle: '', items: [], note: '', ctaText: 'Consultar', ctaLink: 'contact.html' }),
      campos: [
        t('title', 'Nombre del plan', { max: 100, req: true }),
        { k: 'icon', tipo: 'emoji', label: 'Ícono', max: 8 },
        area('description', 'Descripción', { max: 500, rows: 3 }),
        {
          k: 'prices', tipo: 'lista', label: 'Precios', max: 4,
          titulo: (it) => [it.amount, it.detail].filter(Boolean).join(' ') || 'Precio',
          nuevo: () => ({ amount: '', detail: '' }),
          campos: [t('amount', 'Monto', { max: 40, ayuda: 'Ej. $20.000 CLP' }), t('detail', 'Detalle', { max: 100, ayuda: 'Ej. por sesión  ·  / USD $25 por clase' })],
        },
        t('priceNote', 'Nota bajo los precios', { max: 200 }),
        t('listTitle', 'Título de la lista', { max: 60, ayuda: 'Ej. “Requisitos:”, “Incluye:”' }),
        { k: 'items', tipo: 'textos', label: 'Elementos de la lista', max: 10, itemMax: 200, nuevo: 'Nuevo elemento' },
        t('note', 'Nota al pie', { max: 300 }),
        t('ctaText', 'Texto del botón', { max: 60 }),
        { k: 'ctaLink', tipo: 'link', label: 'Enlace del botón', max: 120, ayuda: 'Una página de la web (contact.html) o un enlace https://' },
      ],
    }],
  },
  {
    clave: 'howItWorks', icon: ListOrdered, titulo: 'Cómo funciona',
    donde: 'Inicio y Servicios · “Comienza en 3 simples pasos”',
    campos: [{
      k: '_lista', tipo: 'lista-raiz', label: 'Pasos', max: 6,
      titulo: (it, i) => `${i + 1}. ${it.title || 'Paso'}`,
      nuevo: () => ({ title: '', desc: '' }),
      campos: [t('title', 'Título', { max: 80, req: true }), area('desc', 'Descripción', { max: 300, rows: 3 })],
    }],
  },
  {
    clave: 'cta', icon: Megaphone, titulo: 'Llamado a contactar',
    donde: 'Página de inicio · franja rosada antes de los testimonios',
    campos: [
      t('title', 'Título', { max: 120 }),
      area('text', 'Texto', { max: 300, rows: 2 }),
      t('button', 'Texto del botón', { max: 60 }),
    ],
  },
  {
    clave: 'sofia', icon: UserRound, titulo: 'Sofi (inicio)',
    donde: 'Página de inicio · bloque “Sofi Rose” y pie de página',
    campos: [
      t('title', 'Nombre', { max: 80 }),
      t('subtitle', 'Subtítulo', { max: 120 }),
      area('desc1', 'Primer párrafo', { max: 800, rows: 5 }),
      area('desc2', 'Segundo párrafo', { max: 800, rows: 5 }),
      t('btnText', 'Texto del botón', { max: 60 }),
      { k: 'btnLink', tipo: 'link', label: 'Enlace del botón', max: 120 },
      { k: 'image', tipo: 'imagen', label: 'Imagen', max: 200, ayuda: 'Ruta de una imagen de la web (ej. img/sofia-london-1.png) o un enlace https://.' },
    ],
  },
  {
    clave: 'about', icon: BookOpen, titulo: 'Nuestra historia',
    donde: 'Página “Sobre nosotros”',
    campos: [
      t('eyebrow', 'Texto pequeño', { max: 60 }),
      t('title', 'Título', { max: 120 }),
      area('quote1', 'Párrafo 1', { max: 1200, rows: 5 }),
      area('quote2', 'Párrafo 2', { max: 1500, rows: 6 }),
      area('quote3', 'Párrafo 3', { max: 1200, rows: 5 }),
      { k: 'badges', tipo: 'textos', label: 'Etiquetas', max: 8, itemMax: 40, nuevo: 'Nueva etiqueta', ayuda: 'Las pastillas que aparecen bajo los párrafos.' },
    ],
  },
  {
    clave: 'faq', icon: CircleHelp, titulo: 'Preguntas frecuentes',
    donde: 'Página “Preguntas frecuentes”',
    campos: [{
      k: '_lista', tipo: 'lista-raiz', label: 'Preguntas', max: 30,
      titulo: (it) => it.question || 'Pregunta',
      nuevo: () => ({ question: '', answer: '' }),
      campos: [
        t('question', 'Pregunta', { max: 200, req: true }),
        { k: 'answer', tipo: 'html', label: 'Respuesta', max: 6000, rows: 8 },
      ],
    }],
  },
  {
    clave: 'contact', icon: Phone, titulo: 'Contacto y redes',
    donde: 'Página Contacto, pie de página y botones flotantes',
    campos: [
      { k: 'whatsapp', tipo: 'whatsapp', label: 'WhatsApp', max: 20, ayuda: 'Solo números con código de país, sin + ni espacios. Ej. 56956627660' },
      { k: 'email', tipo: 'email', label: 'Email de contacto', max: 150 },
      t('location', 'Ubicación', { max: 120 }),
      t('schedule', 'Horario de atención', { max: 200 }),
      { k: 'instagram', tipo: 'url', label: 'Instagram', max: 200, ayuda: 'Enlace completo, empieza con https://' },
      { k: 'youtube', tipo: 'url', label: 'YouTube', max: 200 },
      { k: 'tiktok', tipo: 'url', label: 'TikTok', max: 200 },
    ],
  },
  {
    clave: 'seo', icon: Search, titulo: 'Buscadores (SEO)',
    donde: 'Cómo aparece la web en Google y al compartirla',
    extra: 'seo',
    campos: [
      t('title', 'Título (pestaña y Google)', { max: 70, recomendado: 60 }),
      area('description', 'Descripción para Google', { max: 200, rows: 3, recomendado: 160 }),
      t('keywords', 'Palabras clave', { max: 300, ayuda: 'Separadas por coma.' }),
      t('ogTitle', 'Título al compartir (WhatsApp, redes)', { max: 100 }),
      area('ogDescription', 'Descripción al compartir', { max: 200, rows: 2 }),
    ],
  },
  {
    clave: 'footer', icon: PanelBottom, titulo: 'Pie de página',
    donde: 'Final de todas las páginas',
    campos: [
      area('desc', 'Descripción de la academia', { max: 300, rows: 3 }),
      area('copy', 'Texto de derechos (copyright)', { max: 300, rows: 2 }),
    ],
  },
  {
    clave: 'visibility', icon: Eye, titulo: 'Secciones visibles',
    donde: 'Página de inicio · mostrar u ocultar bloques',
    ayuda: 'Apaga lo que no quieras mostrar por ahora. Los cambios se publican al guardar.',
    campos: [
      { k: 'features', tipo: 'interruptor', label: 'Ventajas' },
      { k: 'programs', tipo: 'interruptor', label: 'Programas (tarjetas que giran)' },
      { k: 'mundo', tipo: 'interruptor', label: 'El inglés en el mundo (globo)' },
      { k: 'howItWorks', tipo: 'interruptor', label: 'Cómo funciona' },
      { k: 'cta', tipo: 'interruptor', label: 'Llamado a contactar' },
      { k: 'testimonials', tipo: 'interruptor', label: 'Testimonios' },
      { k: 'sofia', tipo: 'interruptor', label: 'Bloque de Sofi' },
    ],
  },
];

// ── Validación en el navegador (misma regla que el backend, para avisar antes de guardar) ──
const FORMATOS = {
  email: [/^[^\s@<>"']+@[^\s@<>"']+\.[^\s@<>"']{2,}$/, 'no es un email válido'],
  url: [/^https?:\/\/[^\s<>"']+$/i, 'debe empezar con https://'],
  link: [/^(https?:\/\/[^\s<>"']+|mailto:[^\s<>"']+|tel:[+0-9]+|#[\w-]*|[\w\-./]+\.html(#[\w-]*)?|\/[\w\-./]*)$/i, 'debe ser una página de la web (ej. contact.html) o un enlace https://'],
  imagen: [/^(https:\/\/[^\s<>"']+|[\w\-./]+\.(png|jpe?g|webp|gif|svg|avif))$/i, 'debe ser una ruta de imagen (ej. img/foto.jpg) o un enlace https://'],
  digits: [/^[0-9]{8,15}$/, 'solo números, con código de país (8 a 15 dígitos)'],
};
const FMT_DE_TIPO = { email: 'email', url: 'url', link: 'link', imagen: 'imagen', whatsapp: 'digits' };
const HTML_PROHIBIDO = [/<\s*\/?\s*(script|iframe|object|embed|style|link|meta|base|form|input|button|svg|math)\b/i, /\son[a-z]+\s*=/i, /javascript\s*:/i, /vbscript\s*:/i, /data\s*:\s*text\/html/i];

function validarCampo(campo, valor, ruta, errores) {
  if (campo.tipo === 'interruptor') return;
  if (campo.tipo === 'lista' || campo.tipo === 'lista-raiz') {
    const arr = Array.isArray(valor) ? valor : [];
    if (campo.max && arr.length > campo.max) errores[ruta] = `Máximo ${campo.max} elementos`;
    arr.forEach((it, i) => campo.campos.forEach((c) => validarCampo(c, it?.[c.k], `${ruta}.${i}.${c.k}`, errores)));
    return;
  }
  if (campo.tipo === 'textos') {
    (Array.isArray(valor) ? valor : []).forEach((v, i) => {
      if (String(v).length > campo.itemMax) errores[`${ruta}.${i}`] = `Máximo ${campo.itemMax} caracteres`;
    });
    return;
  }
  const v = String(valor ?? '').trim();
  if (campo.req && v === '') { errores[ruta] = 'Es obligatorio'; return; }
  if (campo.max && v.length > campo.max) { errores[ruta] = `Máximo ${campo.max} caracteres (tiene ${v.length})`; return; }
  if (v === '') return;
  const fmt = FMT_DE_TIPO[campo.tipo];
  if (fmt && !FORMATOS[fmt][0].test(v)) { errores[ruta] = `${FORMATOS[fmt][1][0].toUpperCase()}${FORMATOS[fmt][1].slice(1)}`; return; }
  if (campo.tipo === 'html') {
    if (HTML_PROHIBIDO.some((re) => re.test(v))) errores[ruta] = 'Contiene HTML no permitido (scripts, formularios, iframes o eventos)';
  } else if (/<[a-z!/]/i.test(v)) {
    errores[ruta] = 'No admite etiquetas HTML, solo texto';
  }
}

// Devuelve { 'ruta.al.campo': 'mensaje' } (vacío si todo está bien).
export function validarSeccion(seccion, valor) {
  const errores = {};
  const lista = seccion.campos[0]?.tipo === 'lista-raiz';
  if (lista) validarCampo(seccion.campos[0], valor, '_lista', errores);
  else seccion.campos.forEach((c) => validarCampo(c, valor?.[c.k], c.k, errores));
  if (seccion.clave === 'hero' && valor?.highlight && !String(valor.title || '').includes(valor.highlight)) {
    errores.highlight = 'La parte resaltada debe aparecer tal cual en el título';
  }
  return errores;
}
