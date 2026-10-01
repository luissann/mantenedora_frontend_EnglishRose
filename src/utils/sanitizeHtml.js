// Limpia HTML para mostrar la vista previa de un texto con formato: solo etiquetas
// básicas, sin scripts, formularios, eventos ni enlaces javascript:. (La landing
// aplica la misma regla al mostrarlo, y el backend rechaza lo peligroso al guardar.)
const BORRAR = ['SCRIPT', 'STYLE', 'IFRAME', 'OBJECT', 'EMBED', 'LINK', 'META', 'FORM', 'INPUT', 'BUTTON', 'SVG', 'MATH', 'BASE', 'TEXTAREA', 'SELECT'];
const PERMITIDO = { P: [], BR: [], STRONG: [], B: [], EM: [], I: [], U: [], UL: [], OL: [], LI: [], SPAN: [], DIV: [], H3: [], H4: [], A: ['href'] };

export function sanitizeHtml(html) {
  const doc = new DOMParser().parseFromString(`<body>${String(html || '')}</body>`, 'text/html');
  const limpiar = (nodo) => {
    Array.from(nodo.childNodes).forEach((h) => {
      if (h.nodeType === 3) return;
      if (h.nodeType !== 1) { h.remove(); return; }
      if (BORRAR.includes(h.tagName)) { h.remove(); return; }
      const permitidos = PERMITIDO[h.tagName];
      if (!permitidos) { limpiar(h); h.replaceWith(...h.childNodes); return; }
      Array.from(h.attributes).forEach((a) => {
        const n = a.name.toLowerCase();
        if (n === 'style') {
          if (/url\s*\(|expression|position|behavior|@import|javascript/i.test(a.value)) h.removeAttribute(a.name);
        } else if (!permitidos.includes(n)) {
          h.removeAttribute(a.name);
        }
      });
      if (h.tagName === 'A') {
        const href = h.getAttribute('href') || '';
        if (!/^(https?:\/\/|mailto:|tel:|#|[\w\-./]+\.html)/i.test(href)) h.removeAttribute('href');
        h.setAttribute('target', '_blank');
        h.setAttribute('rel', 'noopener noreferrer');
      }
      limpiar(h);
    });
  };
  limpiar(doc.body);
  return doc.body.innerHTML;
}

export default sanitizeHtml;
