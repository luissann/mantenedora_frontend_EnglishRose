import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { getProgramacionMensajes, getProgramacionMensaje, crearProgramacionMensaje, actualizarProgramacionMensaje, eliminarProgramacionMensaje, getNotificaciones, getCalendarioMensual } from '../api/programacionMensajes';

export function useCalendarioMensual(anio, mes) {
  return useQuery({
    queryKey: ['programacion-calendario', anio, mes],
    queryFn: () => getCalendarioMensual(anio, mes),
  });
}

export function useNotificaciones(filters = {}, options = {}) {
  return useQuery({
    queryKey: ['notificaciones', filters],
    queryFn: () => getNotificaciones(filters),
    refetchInterval: 60_000, // revisa cada minuto por nuevos envíos
    ...options,
  });
}

export function useProgramacionMensajes(filters = {}) {
  return useQuery({
    queryKey: ['programacion-mensajes', filters],
    queryFn: () => getProgramacionMensajes(filters),
  });
}

export function useProgramacionMensaje(id) {
  return useQuery({
    queryKey: ['programacion-mensaje', id],
    queryFn: () => getProgramacionMensaje(id),
    enabled: !!id,
  });
}

export function useCrearProgramacionMensaje() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: crearProgramacionMensaje,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['programacion-mensajes'] });
      toast.success('Programación de mensajes creada');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Error al crear programación');
    },
  });
}

export function useActualizarProgramacionMensaje() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...payload }) => actualizarProgramacionMensaje(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['programacion-mensajes'] });
      queryClient.invalidateQueries({ queryKey: ['programacion-mensaje'] });
      toast.success('Programación actualizada');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Error al actualizar programación');
    },
  });
}

export function useEliminarProgramacionMensaje() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: eliminarProgramacionMensaje,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['programacion-mensajes'] });
      toast.success('Programación eliminada');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Error al eliminar programación');
    },
  });
}
