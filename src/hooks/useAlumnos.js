import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { getAlumnos, getAlumno, getAlumnoCompleto, crearAlumno, actualizarAlumno, eliminarAlumno } from '../api/alumnos';

export function useAlumnos(filters = {}) {
  return useQuery({
    queryKey: ['alumnos', filters],
    queryFn: () => getAlumnos(filters),
  });
}

export function useAlumno(id) {
  return useQuery({
    queryKey: ['alumno', id],
    queryFn: () => getAlumno(id),
    enabled: !!id,
  });
}

export function useAlumnoCompleto(id) {
  return useQuery({
    queryKey: ['alumnoCompleto', id],
    queryFn: () => getAlumnoCompleto(id),
    enabled: !!id,
  });
}

export function useCrearAlumno() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: crearAlumno,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alumnos'] });
      toast.success('Alumno creado exitosamente');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Error al crear alumno');
    },
  });
}

export function useActualizarAlumno() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...payload }) => actualizarAlumno(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alumnos'] });
      queryClient.invalidateQueries({ queryKey: ['alumno'] });
      queryClient.invalidateQueries({ queryKey: ['alumnoCompleto'] });
      toast.success('Alumno actualizado exitosamente');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Error al actualizar alumno');
    },
  });
}

export function useEliminarAlumno() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: eliminarAlumno,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alumnos'] });
      toast.success('Alumno eliminado exitosamente');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Error al eliminar alumno');
    },
  });
}
