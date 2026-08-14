// Código verificador = código de país (ej. Chile +56). Lista acotada a los
// países más relevantes para la academia (Chile primero, resto de Latam,
// España y otros comunes). "OTHR" es la opción de escape para cualquier país
// no listado: no antepone ningún código, se escribe el número completo a mano.
export const COUNTRIES = [
  { iso2: 'CL', name: 'Chile', dial: '+56' },
  { iso2: 'AR', name: 'Argentina', dial: '+54' },
  { iso2: 'PE', name: 'Perú', dial: '+51' },
  { iso2: 'CO', name: 'Colombia', dial: '+57' },
  { iso2: 'MX', name: 'México', dial: '+52' },
  { iso2: 'BO', name: 'Bolivia', dial: '+591' },
  { iso2: 'EC', name: 'Ecuador', dial: '+593' },
  { iso2: 'PY', name: 'Paraguay', dial: '+595' },
  { iso2: 'UY', name: 'Uruguay', dial: '+598' },
  { iso2: 'VE', name: 'Venezuela', dial: '+58' },
  { iso2: 'BR', name: 'Brasil', dial: '+55' },
  { iso2: 'CR', name: 'Costa Rica', dial: '+506' },
  { iso2: 'PA', name: 'Panamá', dial: '+507' },
  { iso2: 'GT', name: 'Guatemala', dial: '+502' },
  { iso2: 'HN', name: 'Honduras', dial: '+504' },
  { iso2: 'SV', name: 'El Salvador', dial: '+503' },
  { iso2: 'NI', name: 'Nicaragua', dial: '+505' },
  { iso2: 'DO', name: 'República Dominicana', dial: '+1' },
  { iso2: 'CU', name: 'Cuba', dial: '+53' },
  { iso2: 'ES', name: 'España', dial: '+34' },
  { iso2: 'US', name: 'Estados Unidos', dial: '+1' },
  { iso2: 'CA', name: 'Canadá', dial: '+1' },
  { iso2: 'GB', name: 'Reino Unido', dial: '+44' },
  { iso2: 'FR', name: 'Francia', dial: '+33' },
  { iso2: 'DE', name: 'Alemania', dial: '+49' },
  { iso2: 'IT', name: 'Italia', dial: '+39' },
  { iso2: 'PT', name: 'Portugal', dial: '+351' },
  { iso2: 'CN', name: 'China', dial: '+86' },
  { iso2: 'JP', name: 'Japón', dial: '+81' },
  { iso2: 'KR', name: 'Corea del Sur', dial: '+82' },
  { iso2: 'IN', name: 'India', dial: '+91' },
  { iso2: 'AU', name: 'Australia', dial: '+61' },
  { iso2: 'NZ', name: 'Nueva Zelanda', dial: '+64' },
  { iso2: 'ZA', name: 'Sudáfrica', dial: '+27' },
  { iso2: 'IL', name: 'Israel', dial: '+972' },
  { iso2: 'AE', name: 'Emiratos Árabes Unidos', dial: '+971' },
  { iso2: 'CH', name: 'Suiza', dial: '+41' },
  { iso2: 'NL', name: 'Países Bajos', dial: '+31' },
  { iso2: 'BE', name: 'Bélgica', dial: '+32' },
  { iso2: 'SE', name: 'Suecia', dial: '+46' },
  { iso2: 'NO', name: 'Noruega', dial: '+47' },
  { iso2: 'RU', name: 'Rusia', dial: '+7' },
  { iso2: 'TR', name: 'Turquía', dial: '+90' },
  { iso2: 'OTHR', name: 'Otro (escribir número completo)', dial: '' },
];

// Windows no renderiza los emoji de bandera (regional indicators) en Chrome:
// muestra las dos letras del código en vez del ícono. Se usa flagcdn.com
// (banderitas reales, cacheadas por el navegador) en lugar de flagEmoji().
export function flagUrl(iso2) {
  if (!iso2 || iso2 === 'OTHR') return null;
  return `https://flagcdn.com/24x18/${iso2.toLowerCase()}.png`;
}

// Encuentra el país cuyo código verificador es prefijo del valor guardado
// (ej. "+56 9 1234 5678" -> Chile, resto "9 1234 5678"). Usa el prefijo más
// largo que calce para no confundir +1 (EEUU/Canadá/RD) con +52, etc.
// Si no calza ninguno (país no listado, o campo vacío), cae en "OTHR" y deja
// el valor tal cual para no perder ni mutilar lo que ya estaba escrito.
export function detectCountry(value) {
  if (!value) return null;

  const candidatos = COUNTRIES.filter((c) => c.dial && value.startsWith(c.dial));
  const match = candidatos.sort((a, b) => b.dial.length - a.dial.length)[0];

  if (!match) return { iso2: 'OTHR', resto: value };

  return { iso2: match.iso2, resto: value.slice(match.dial.length).trim() };
}
