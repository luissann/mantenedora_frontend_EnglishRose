import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { getBoletas, getBoleta, generarBoletas, actualizarBoleta, eliminarBoleta, getResumenBoletas } from '../api/boletas';

export function useBoletas(filters = {}) {
  return useQuery({
    queryKey: ['boletas', filters],
    queryFn: () => getBoletas(filters),
  });
}

export function useBoleta(id) {
  return useQuery({
    queryKey: ['boleta', id],
    queryFn: () => getBoleta(id),
    enabled: !!id,
  });
}

export function useResumenBoletas(mes, anio) {
  return useQuery({
    queryKey: ['boletas-resumen', mes, anio],
    queryFn: () => getResumenBoletas({ mes, anio }),
    enabled: !!mes && !!anio,
  });
}

export function useGenerarBoletas() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: generarBoletas,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['boletas'] });
      queryClient.invalidateQueries({ queryKey: ['boletas-resumen'] });
      toast.success(data?.message || 'Boletas generadas');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Error al generar boletas');
    },
  });
}

export function useActualizarBoleta() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...payload }) => actualizarBoleta(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['boletas'] });
      queryClient.invalidateQueries({ queryKey: ['boletas-resumen'] });
      toast.success('Boleta actualizada');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Error al actualizar boleta');
    },
  });
}

export function useEliminarBoleta() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: eliminarBoleta,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['boletas'] });
      queryClient.invalidateQueries({ queryKey: ['boletas-resumen'] });
      toast.success('Boleta eliminada');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Error al eliminar boleta');
    },
  });
}
