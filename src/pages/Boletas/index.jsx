import { useState } from 'react';
import { RefreshCw, CreditCard, Percent, Receipt, TrendingUp } from 'lucide-react';
import { PageHeader } from '../../components/shared/PageHeader';
import { StatCard } from '../../components/shared/StatCard';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Spinner } from '../../components/ui/Spinner';
import { EmptyState } from '../../components/shared/EmptyState';
import { useBoletas, useResumenBoletas, useGenerarBoletas, useActualizarBoleta } from '../../hooks/useBoletas';
import { formatCLP } from '../../utils/formatters';

const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

const ESTADOS = ['PENDIENTE', 'LISTA', 'CANJE', 'ANULADA'];

export default function BoletasIndexPage() {
  const hoy = new Date();
  const [mes, setMes] = useState(hoy.getMonth() + 1);
  const [anio, setAnio] = useState(hoy.getFullYear());

  const { data: boletasData, isLoading } = useBoletas({ mes, anio, limit: 100 });
  const { data: resumenData } = useResumenBoletas(mes, anio);
  const generarMutation = useGenerarBoletas();
  const actualizarMutation = useActualizarBoleta();

  const boletas = boletasData?.data || [];
  const resumen = resumenData?.data || {};

  const handleCantidadClasesBlur = (boleta, value) => {
    const nueva = Number(value);
    if (Number.isNaN(nueva) || nueva === boleta.cantidad_clases) return;
    actualizarMutation.mutate({ id: boleta.id, cantidad_clases: nueva });
  };

  const handleEstadoChange = (boleta, estado) => {
    if (estado === boleta.estado) return;
    actualizarMutation.mutate({ id: boleta.id, estado });
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Boletas" />

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
          Generar boletas del mes
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <StatCard icon={Receipt} label="Total Mensual" value={formatCLP(resumen.totalMensual || 0)} color="rose" />
        <StatCard icon={Percent} label="Retención" value={formatCLP(resumen.totalRetencion || 0)} color="yellow" />
        <StatCard icon={CreditCard} label="Total Boleta" value={formatCLP(resumen.totalBoleta || 0)} color="green" />
        <StatCard icon={TrendingUp} label="Ganancia Real" value={formatCLP(resumen.gananciaReal || 0)} color="rose" />
      </div>

      {isLoading ? (
        <div className="flex h-80 items-center justify-center">
          <Spinner size="lg" />
        </div>
      ) : boletas.length === 0 ? (
        <EmptyState title="No hay boletas para este mes" subtitle="Usa 'Generar boletas del mes' para calcularlas desde los horarios activos." />
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="min-w-full border-separate border-spacing-0 text-left text-sm">
              <thead className="bg-rose-light/60">
                <tr>
                  {['Alumno', 'Valor x Clase', 'Cant. Clases', 'Total Mensual', 'Retención', 'Total Boleta', 'Estado'].map((h) => (
                    <th key={h} className="border-b border-border px-4 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-text-secondary">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {boletas.map((boleta) => (
                  <tr key={boleta.id} className="border-b border-border last:border-b-0 hover:bg-rose-light/20">
                    <td className="px-4 py-3">{boleta.alumno ? `${boleta.alumno.nombre} ${boleta.alumno.apellido}` : '-'}</td>
                    <td className="px-4 py-3">{boleta.moneda === 'USD' ? `USD $${Number(boleta.valor_clase).toFixed(2)}` : formatCLP(boleta.valor_clase)}</td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        min="0"
                        defaultValue={boleta.cantidad_clases}
                        onBlur={(e) => handleCantidadClasesBlur(boleta, e.target.value)}
                        className="w-16 rounded-xl border border-border-input px-2 py-1 text-sm"
                      />
                    </td>
                    <td className="px-4 py-3">{boleta.moneda === 'USD' ? `USD $${Number(boleta.total_mensual).toFixed(2)}` : formatCLP(boleta.total_mensual)}</td>
                    <td className="px-4 py-3 text-text-secondary">{boleta.moneda === 'USD' ? `USD $${Number(boleta.monto_retencion).toFixed(2)}` : formatCLP(boleta.monto_retencion)}</td>
                    <td className="px-4 py-3 font-semibold">{boleta.moneda === 'USD' ? `USD $${Number(boleta.total_boleta).toFixed(2)}` : formatCLP(boleta.total_boleta)}</td>
                    <td className="px-4 py-3">
                      <select
                        defaultValue={boleta.estado}
                        onChange={(e) => handleEstadoChange(boleta, e.target.value)}
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
