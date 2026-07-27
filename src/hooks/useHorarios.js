import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  getHorarios,
  getHorario,
  getHorariosPorAlumno,
  getHorariosPorPrograma,
  crearHorario,
  actualizarHorario,
  eliminarHorario,
} from '../api/horarios';

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

export function useHorariosPorAlumno(idAlumno) {
  return useQuery({
    queryKey: ['horarios', 'alumno', idAlumno],
    queryFn: () => getHorariosPorAlumno(idAlumno),
    enabled: !!idAlumno,
  });
}

export function useHorariosPorPrograma(idAlumnoPrograma) {
  return useQuery({
    queryKey: ['horarios', 'programa', idAlumnoPrograma],
    queryFn: () => getHorariosPorPrograma(idAlumnoPrograma),
    enabled: !!idAlumnoPrograma,
  });
}

export function useCrearHorario() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: crearHorario,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['horarios'] });
      queryClient.invalidateQueries({ queryKey: ['alumnoCompleto'] });
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
      queryClient.invalidateQueries({ queryKey: ['alumnoCompleto'] });
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
      queryClient.invalidateQueries({ queryKey: ['alumnoCompleto'] });
      toast.success('Horario eliminado exitosamente');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Error al eliminar horario');
    },
  });
}
