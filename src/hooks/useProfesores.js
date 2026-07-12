import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { getProfesores, getProfesor, crearProfesor, actualizarProfesor, eliminarProfesor } from '../api/profesores';

export function useProfesores(filters = {}) {
  return useQuery({
    queryKey: ['profesores', filters],
    queryFn: () => getProfesores(filters),
  });
}

export function useProfesor(id) {
  return useQuery({
    queryKey: ['profesor', id],
    queryFn: () => getProfesor(id),
    enabled: !!id,
  });
}

export function useCrearProfesor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: crearProfesor,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profesores'] });
      toast.success('Profesor creado');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Error al crear profesor');
    },
  });
}

export function useActualizarProfesor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...payload }) => actualizarProfesor(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profesores'] });
      queryClient.invalidateQueries({ queryKey: ['profesor'] });
      toast.success('Profesor actualizado');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Error al actualizar profesor');
    },
  });
}

export function useEliminarProfesor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: eliminarProfesor,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profesores'] });
      toast.success('Profesor desactivado');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Error al desactivar profesor');
    },
  });
}
