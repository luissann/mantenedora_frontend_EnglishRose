import { useState } from 'react';
import { RefreshCw, Clock, Wallet } from 'lucide-react';
import { PageHeader } from '../../components/shared/PageHeader';
import { StatCard } from '../../components/shared/StatCard';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Spinner } from '../../components/ui/Spinner';
import { EmptyState } from '../../components/shared/EmptyState';
import { usePagosProfesores, useGenerarPagosProfesores, useActualizarPagoProfesor } from '../../hooks/usePagosProfesores';
import { formatCLP } from '../../utils/formatters';

const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

const ESTADOS = ['PENDIENTE', 'PAGADO'];

export default function PagosProfesoresIndexPage() {
  const hoy = new Date();
  const [mes, setMes] = useState(hoy.getMonth() + 1);
  const [anio, setAnio] = useState(hoy.getFullYear());

  const { data: pagosData, isLoading } = usePagosProfesores({ mes, anio, limit: 100 });
  const generarMutation = useGenerarPagosProfesores();
  const actualizarMutation = useActualizarPagoProfesor();

  const pagos = pagosData?.data || [];
  const totalHoras = pagos.reduce((sum, p) => sum + Number(p.horas_dictadas), 0);
  const totalMonto = pagos.reduce((sum, p) => sum + Number(p.monto), 0);

  const handleMontoBlur = (pago, value) => {
    const nuevo = Number(value);
    if (Number.isNaN(nuevo) || nuevo === Number(pago.monto)) return;
    actualizarMutation.mutate({ id: pago.id, monto: nuevo });
  };

  const handleEstadoChange = (pago, estado) => {
    if (estado === pago.estado) return;
    actualizarMutation.mutate({ id: pago.id, estado });
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Pagos a Profesores" />

      <div className="flex flex-wrap items-end gap-3">
        <div>
          <label className="mb-1 block text-sm text-text-secondary">Mes</label>
          <select
            value={mes}
            onChange={(e) => setMes(Number(e.target.value))}
            className="rounded-2xl border border-border-input bg-white px-4 py-3 text-sm text-text-primary"
          >
            {MESES.map((nombre, idx) => (
              <option key={nombre} value={idx + 1}>{nombre}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm text-text-secondary">Año</label>
          <input
            type="number"
            value={anio}
            onChange={(e) => setAnio(Number(e.target.value))}
            className="w-28 rounded-2xl border border-border-input bg-white px-4 py-3 text-sm text-text-primary"
          />
        </div>
        <Button
          variant="primary"
          leftIcon={<RefreshCw className="h-4 w-4" />}
          loading={generarMutation.isPending}
          onClick={() => generarMutation.mutate({ mes, anio })}
        >
          Calcular pagos del mes
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <StatCard icon={Clock} label="Horas Dictadas" value={totalHoras.toFixed(1)} color="rose" />
        <StatCard icon={Wallet} label="Total a Pagar" value={formatCLP(totalMonto)} color="green" />
      </div>

      {isLoading ? (
        <div className="flex h-80 items-center justify-center">
          <Spinner size="lg" />
        </div>
      ) : pagos.length === 0 ? (
        <EmptyState title="No hay pagos calculados para este mes" subtitle="Usa 'Calcular pagos del mes' para generarlos desde los horarios activos." />
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="min-w-full border-separate border-spacing-0 text-left text-sm">
              <thead className="bg-rose-light/60">
                <tr>
                  {['Profesor', 'Horas Dictadas', 'Tarifa/hora', 'Monto', 'Estado'].map((h) => (
                    <th key={h} className="border-b border-border px-4 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-text-secondary">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pagos.map((pago) => (
                  <tr key={pago.id} className="border-b border-border last:border-b-0 hover:bg-rose-light/20">
                    <td className="px-4 py-3">{pago.profesor ? `${pago.profesor.nombre} ${pago.profesor.apellido}` : '-'}</td>
                    <td className="px-4 py-3">{Number(pago.horas_dictadas).toFixed(1)} hrs</td>
                    <td className="px-4 py-3 text-text-secondary">{formatCLP(pago.tarifa_hora)}</td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        min="0"
                        defaultValue={pago.monto}
                        onBlur={(e) => handleMontoBlur(pago, e.target.value)}
                        className="w-28 rounded-xl border border-border-input px-2 py-1 text-sm"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <select
                        defaultValue={pago.estado}
                        onChange={(e) => handleEstadoChange(pago, e.target.value)}
                        className="rounded-xl border border-border-input px-2 py-1 text-sm"
                      >
                        {ESTADOS.map((estado) => (
                          <option key={estado} value={estado}>{estado}</option>
                        ))}
                      </select>
                    </td>
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
