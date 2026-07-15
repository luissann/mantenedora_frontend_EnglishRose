import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  getAlumnoProgramasPorAlumno,
  getAlumnoPrograma,
  crearAlumnoPrograma,
  actualizarAlumnoPrograma,
  eliminarAlumnoPrograma,
} from '../api/alumnoProgramas';

export function useAlumnoProgramasPorAlumno(idAlumno) {
  return useQuery({
    queryKey: ['alumno-programas', 'alumno', idAlumno],
    queryFn: () => getAlumnoProgramasPorAlumno(idAlumno),
    enabled: !!idAlumno,
  });
}

export function useAlumnoPrograma(id) {
  return useQuery({
    queryKey: ['alumno-programa', id],
    queryFn: () => getAlumnoPrograma(id),
    enabled: !!id,
  });
}

export function useCrearAlumnoPrograma() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: crearAlumnoPrograma,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alumno-programas'] });
      queryClient.invalidateQueries({ queryKey: ['alumnoCompleto'] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Error al crear el programa del alumno');
    },
  });
}

export function useActualizarAlumnoPrograma() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...payload }) => actualizarAlumnoPrograma(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alumno-programas'] });
      queryClient.invalidateQueries({ queryKey: ['alumno-programa'] });
      queryClient.invalidateQueries({ queryKey: ['alumnoCompleto'] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Error al actualizar el programa del alumno');
    },
  });
}

export function useEliminarAlumnoPrograma() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: eliminarAlumnoPrograma,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alumno-programas'] });
      queryClient.invalidateQueries({ queryKey: ['alumnoCompleto'] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Error al eliminar el programa del alumno');
    },
  });
}
