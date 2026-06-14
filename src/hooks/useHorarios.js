import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { getHorarios, getHorario, crearHorario, actualizarHorario, eliminarHorario } from '../api/horarios';

export function useHorarios(filters = {}) {
  return useQuery({
    queryKey: ['horarios', filters],
    queryFn: () => getHorarios(filters),
  });
}

export function useHorario(id) {
  return useQuery({
    queryKey: ['horario', id],
    queryFn: () => getHorario(id),
    enabled: !!id,
  });
}

export function useCrearHorario() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: crearHorario,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['horarios'] });
      toast.success('Horario creado exitosamente');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Error al crear horario');
    },
  });
}

export function useActualizarHorario() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...payload }) => actualizarHorario(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['horarios'] });
      queryClient.invalidateQueries({ queryKey: ['horario'] });
      toast.success('Horario actualizado exitosamente');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Error al actualizar horario');
    },
  });
}

export function useEliminarHorario() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: eliminarHorario,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['horarios'] });
      toast.success('Horario eliminado exitosamente');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Error al eliminar horario');
    },
  });
}
