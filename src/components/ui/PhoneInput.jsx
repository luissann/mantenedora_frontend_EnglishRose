import { useEffect, useMemo, useState } from 'react';
import { Globe } from 'lucide-react';
import { Select } from './Select';
import { COUNTRIES, flagUrl, detectCountry } from '../../utils/countries';

// Combina un selector de país (código verificador, ej. Chile +56) con el
// número local, pero hacia afuera sigue siendo un único string "telefono"
// (igual al formato que ya usaba el backend/WhatsApp), para no tener que
// tocar los schemas ni los payloads que ya consumen ese campo.
export function PhoneInput({ label = 'Teléfono', value, onChange, error, placeholder }) {
  const opciones = useMemo(
    () => COUNTRIES.map((c) => ({
      value: c.iso2,
      label: c.dial ? `${c.name} (${c.dial})` : c.name,
      icon: flagUrl(c.iso2)
        ? <img src={flagUrl(c.iso2)} alt="" className="h-3.5 w-5 shrink-0 rounded-sm object-cover" />
        : <Globe className="h-3.5 w-3.5 shrink-0 text-text-secondary" />,
    })),
    []
  );

  const inicial = detectCountry(value);
  const [iso2, setIso2] = useState(inicial?.iso2 || 'CL');
  const [numero, setNumero] = useState(inicial?.resto ?? value ?? '');

  const dialDe = (codigo) => COUNTRIES.find((c) => c.iso2 === codigo)?.dial || '';

  // Si el valor externo cambia por fuera de este componente (ej. se cargó el
  // alumno en modo edición luego de un fetch async) y ya no coincide con lo
  // que este input está componiendo, resincroniza país + número.
  useEffect(() => {
    const compuesto = `${dialDe(iso2)} ${numero}`.trim();
    if (value !== compuesto) {
      const detectado = detectCountry(value);
      setIso2(detectado?.iso2 || 'CL');
      setNumero(detectado?.resto ?? value ?? '');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const emitir = (nuevoIso2, nuevoNumero) => {
    onChange(`${dialDe(nuevoIso2)} ${nuevoNumero}`.trim());
  };

  return (
    <div>
      {label && <span className="mb-2 block text-sm text-text-secondary">{label}</span>}
      <div className="grid grid-cols-[minmax(0,11.5rem)_1fr] gap-2">
        <Select
          options={opciones}
          value={iso2}
          onChange={(nuevoIso2) => {
            setIso2(nuevoIso2);
            emitir(nuevoIso2, numero);
          }}
          searchable
          placeholder="País..."
        />
        <input
          type="tel"
          value={numero}
          placeholder={placeholder}
          onChange={(e) => {
            setNumero(e.target.value);
            emitir(iso2, e.target.value);
          }}
          className={`w-full rounded-2xl border px-4 py-3 text-sm outline-none transition focus:ring-2 focus:ring-rose/20 ${
            error ? 'border-red-400 focus:border-red-500' : 'border-border-input focus:border-rose'
          }`}
        />
      </div>
      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
    </div>
  );
}

export default PhoneInput;
