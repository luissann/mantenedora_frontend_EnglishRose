import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { getProgramas, getPrograma, crearPrograma, actualizarPrograma, eliminarPrograma } from '../api/programas';

export function useProgramas(filters = {}) {
  return useQuery({
    queryKey: ['programas', filters],
    queryFn: () => getProgramas(filters),
  });
}

export function usePrograma(id) {
  return useQuery({
    queryKey: ['programa', id],
    queryFn: () => getPrograma(id),
    enabled: !!id,
  });
}

export function useCrearPrograma() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: crearPrograma,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['programas'] });
      toast.success('Programa creado exitosamente');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Error al crear programa');
    },
  });
}

export function useActualizarPrograma() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...payload }) => actualizarPrograma(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['programas'] });
      queryClient.invalidateQueries({ queryKey: ['programa'] });
      toast.success('Programa actualizado exitosamente');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Error al actualizar programa');
    },
  });
}

export function useEliminarPrograma() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: eliminarPrograma,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['programas'] });
      toast.success('Programa eliminado exitosamente');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Error al eliminar programa');
    },
  });
}
