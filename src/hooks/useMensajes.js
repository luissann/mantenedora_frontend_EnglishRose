import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  getMensajes,
  getResumenMensajes,
  marcarLeidoMensaje,
  eliminarMensaje,
} from '../api/mensajes';

export function useMensajes(filters = {}) {
  return useQuery({
    queryKey: ['mensajes', filters],
    queryFn: () => getMensajes(filters),
  });
}

// Conteo de nuevos/leídos: alimenta el distintivo del menú y las pestañas. Se
// refresca solo para que un mensaje nuevo aparezca sin recargar la página.
export function useResumenMensajes() {
  return useQuery({
    queryKey: ['mensajes-resumen'],
    queryFn: getResumenMensajes,
    refetchInterval: 60_000,
  });
}

function useInvalidarMensajes() {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: ['mensajes'] });
    queryClient.invalidateQueries({ queryKey: ['mensajes-resumen'] });
  };
}

export function useMarcarLeidoMensaje() {
  const invalidar = useInvalidarMensajes();
  return useMutation({
    mutationFn: ({ id, leido }) => marcarLeidoMensaje(id, leido),
    onSuccess: (_resp, { leido }) => {
      invalidar();
      toast.success(leido ? 'Mensaje marcado como leído' : 'Mensaje marcado como no leído');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Error al actualizar el mensaje');
    },
  });
}

export function useEliminarMensaje() {
  const invalidar = useInvalidarMensajes();
  return useMutation({
    mutationFn: eliminarMensaje,
    onSuccess: () => {
      invalidar();
      toast.success('Mensaje eliminado');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Error al eliminar el mensaje');
    },
  });
}
