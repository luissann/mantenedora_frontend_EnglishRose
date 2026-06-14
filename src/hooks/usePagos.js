import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { getPagos, getPago, crearPago, actualizarPago, eliminarPago } from '../api/pagos';

export function usePagos(filters = {}) {
  return useQuery({
    queryKey: ['pagos', filters],
    queryFn: () => getPagos(filters),
  });
}

export function usePago(id) {
  return useQuery({
    queryKey: ['pago', id],
    queryFn: () => getPago(id),
    enabled: !!id,
  });
}

export function useCrearPago() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: crearPago,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pagos'] });
      toast.success('Pago creado exitosamente');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Error al crear pago');
    },
  });
}

export function useActualizarPago() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...payload }) => actualizarPago(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pagos'] });
      queryClient.invalidateQueries({ queryKey: ['pago'] });
      toast.success('Pago actualizado exitosamente');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Error al actualizar pago');
    },
  });
}

export function useEliminarPago() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: eliminarPago,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pagos'] });
      toast.success('Pago eliminado exitosamente');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Error al eliminar pago');
    },
  });
}
