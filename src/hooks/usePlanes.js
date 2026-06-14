import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { getPlanes, getPlan, crearPlan, actualizarPlan, eliminarPlan } from '../api/planes';

export function usePlanes(filters = {}) {
  return useQuery({
    queryKey: ['planes', filters],
    queryFn: () => getPlanes(filters),
  });
}

export function usePlan(id) {
  return useQuery({
    queryKey: ['plan', id],
    queryFn: () => getPlan(id),
    enabled: !!id,
  });
}

export function useCrearPlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: crearPlan,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['planes'] });
      toast.success('Plan creado exitosamente');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Error al crear plan');
    },
  });
}

export function useActualizarPlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...payload }) => actualizarPlan(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['planes'] });
      queryClient.invalidateQueries({ queryKey: ['plan'] });
      toast.success('Plan actualizado exitosamente');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Error al actualizar plan');
    },
  });
}

export function useEliminarPlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: eliminarPlan,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['planes'] });
      toast.success('Plan eliminado exitosamente');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Error al eliminar plan');
    },
  });
}
