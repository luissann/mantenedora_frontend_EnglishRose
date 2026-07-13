import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../../components/shared/PageHeader';
import { Card } from '../../components/ui/Card';
import { Select } from '../../components/ui/Select';
import { Spinner } from '../../components/ui/Spinner';
import { EmptyState } from '../../components/shared/EmptyState';
import { useHorarios } from '../../hooks/useHorarios';
import { useProfesores } from '../../hooks/useProfesores';
import { formatTime } from '../../utils/formatters';

const DIAS = [
  { value: 'LUNES', label: 'Lunes' },
  { value: 'MARTES', label: 'Martes' },
  { value: 'MIERCOLES', label: 'Miércoles' },
  { value: 'JUEVES', label: 'Jueves' },
  { value: 'VIERNES', label: 'Viernes' },
  { value: 'SABADO', label: 'Sábado' },
  { value: 'DOMINGO', label: 'Domingo' },
];

export default function HorarioSemanalPage() {
  const navigate = useNavigate();
  const [idProfesor, setIdProfesor] = useState('');

  const { data: profesoresData } = useProfesores({ limit: 100, activo: 'true' });
  const { data: horariosData, isLoading } = useHorarios({
    id_profesor: idProfesor,
    activo: 'true',
    limit: 100,
  });

  const profesores = (profesoresData?.data || []).map((p) => ({
    value: String(p.id),
    label: `${p.nombre} ${p.apellido}`,
  }));

  const horarios = horariosData?.data || [];

  const franjas = useMemo(() => {
    const horas = new Set(horarios.map((h) => h.hora_inicio));
    return [...horas].sort();
  }, [horarios]);

  const celda = (dia, hora) =>
    horarios.filter((h) => h.dia_semana === dia && h.hora_inicio === hora);

  return (
    <div className="space-y-6">
      <PageHeader title="Horario Semanal por Profesor" />

      <div className="grid gap-4 md:grid-cols-4">
        <Select
          label="Profesor"
          options={profesores}
          value={idProfesor}
          onChange={setIdProfesor}
          placeholder="Selecciona un profesor"
          searchable
        />
      </div>

      {!idProfesor ? (
        <EmptyState title="Selecciona un profesor para ver su horario semanal" />
      ) : isLoading ? (
        <div className="flex h-80 items-center justify-center">
          <Spinner size="lg" />
        </div>
      ) : horarios.length === 0 ? (
        <EmptyState title="Este profesor no tiene horarios asignados" />
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="min-w-full border-separate border-spacing-0 text-left text-sm">
              <thead className="bg-rose-light/60">
                <tr>
                  <th className="border-b border-border px-4 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-text-secondary">Hora</th>
                  {DIAS.map((dia) => (
                    <th key={dia.value} className="border-b border-border px-4 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-text-secondary">
                      {dia.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {franjas.map((hora) => (
                  <tr key={hora} className="border-b border-border last:border-b-0">
                    <td className="px-4 py-3 align-top text-xs font-semibold text-text-secondary whitespace-nowrap">
                      {formatTime(hora)}
                    </td>
                    {DIAS.map((dia) => (
                      <td key={dia.value} className="px-2 py-2 align-top">
                        {celda(dia.value, hora).map((h) => (
                          <button
                            key={h.id}
                            type="button"
                            onClick={() => navigate(`/horarios/${h.id}/editar`)}
                            className="mb-1 block w-full rounded-xl bg-rose-light/70 px-2 py-1.5 text-left text-xs text-rose-text hover:bg-rose-light"
                          >
                            <div className="font-semibold">{h.alumno ? `${h.alumno.nombre} ${h.alumno.apellido}` : 'Alumno'}</div>
                            <div className="text-text-muted">{formatTime(h.hora_inicio)} - {formatTime(h.hora_fin)}</div>
                          </button>
                        ))}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
