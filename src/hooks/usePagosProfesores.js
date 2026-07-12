import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { getPagosProfesores, getPagoProfesor, generarPagosProfesores, actualizarPagoProfesor, eliminarPagoProfesor } from '../api/pagosProfesores';

export function usePagosProfesores(filters = {}) {
  return useQuery({
    queryKey: ['pagos-profesores', filters],
    queryFn: () => getPagosProfesores(filters),
  });
}

export function usePagoProfesor(id) {
  return useQuery({
    queryKey: ['pago-profesor', id],
    queryFn: () => getPagoProfesor(id),
    enabled: !!id,
  });
}

export function useGenerarPagosProfesores() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: generarPagosProfesores,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['pagos-profesores'] });
      queryClient.invalidateQueries({ queryKey: ['boletas-resumen'] });
      toast.success(data?.message || 'Pagos a profesores generados');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Error al generar pagos a profesores');
    },
  });
}

export function useActualizarPagoProfesor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...payload }) => actualizarPagoProfesor(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pagos-profesores'] });
      queryClient.invalidateQueries({ queryKey: ['boletas-resumen'] });
      toast.success('Pago actualizado');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Error al actualizar pago');
    },
  });
}

export function useEliminarPagoProfesor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: eliminarPagoProfesor,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pagos-profesores'] });
      toast.success('Pago eliminado');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Error al eliminar pago');
    },
  });
}
