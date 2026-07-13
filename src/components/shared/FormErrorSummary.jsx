import { AlertTriangle } from 'lucide-react';

function collectMessages(errors) {
  const mensajes = [];
  for (const value of Object.values(errors || {})) {
    if (!value) continue;
    if (typeof value.message === 'string' && value.message) {
      mensajes.push(value.message);
    } else if (typeof value === 'object') {
      mensajes.push(...collectMessages(value));
    }
  }
  return mensajes;
}

export function FormErrorSummary({ errors }) {
  const mensajes = collectMessages(errors);

  if (mensajes.length === 0) return null;

  return (
    <div className="flex items-start gap-3 rounded-2xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-800">
      <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
      <div>
        <p className="font-semibold">Revisa los siguientes campos antes de guardar</p>
        <ul className="mt-1 list-disc space-y-0.5 pl-4">
          {mensajes.map((mensaje, index) => (
            <li key={index}>{mensaje}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default FormErrorSummary;
