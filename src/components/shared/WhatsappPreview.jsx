import { DIAS_DISPLAY } from '../../utils/constants';

export function WhatsappPreview({ alumno, horarios = [] }) {
  const formattedSchedule = horarios
    .map((item) => `${DIAS_DISPLAY[item.dia_semana] || item.dia_semana} ${item.hora_inicio}`)
    .join('\n');

  return (
    <div className="rounded-3xl border border-border bg-[#DCF8C6] p-5 shadow-sm text-text-primary">
      <p className="text-sm font-semibold">Vista previa</p>
      <div className="mt-3 whitespace-pre-line rounded-3xl bg-white p-4 text-sm leading-6 text-text-secondary">
        {`Holaaa! Confirmamos? 😊\n${formattedSchedule}`}
      </div>
      <div className="mt-4 flex items-center justify-between text-xs text-text-secondary">
        <span>Mensaje de WhatsApp</span>
        <span>✓✓</span>
      </div>
    </div>
  );
}

export default WhatsappPreview;
