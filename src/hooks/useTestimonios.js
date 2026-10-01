import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  getTestimonios,
  getResumenTestimonios,
  cambiarEstadoTestimonio,
  actualizarTestimonio,
  eliminarTestimonio,
} from '../api/testimonios';

export function useTestimonios(filters = {}) {
  return useQuery({
    queryKey: ['testimonios', filters],
    queryFn: () => getTestimonios(filters),
  });
}

// Conteo por estado: alimenta el distintivo del menú y las pestañas. Se
// refresca solo para que un testimonio nuevo aparezca sin recargar la página.
export function useResumenTestimonios() {
  return useQuery({
    queryKey: ['testimonios-resumen'],
    queryFn: getResumenTestimonios,
    refetchInterval: 60_000,
  });
}

function useInvalidarTestimonios() {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: ['testimonios'] });
    queryClient.invalidateQueries({ queryKey: ['testimonios-resumen'] });
  };
}

const MENSAJES_ESTADO = {
  APROBADO: 'Testimonio aprobado: ya se muestra en la web',
  RECHAZADO: 'Testimonio rechazado',
  PENDIENTE: 'Testimonio devuelto a pendientes',
};

export function useCambiarEstadoTestimonio() {
  const invalidar = useInvalidarTestimonios();
  return useMutation({
    mutationFn: ({ id, estado }) => cambiarEstadoTestimonio(id, estado),
    onSuccess: (_resp, { estado }) => {
      invalidar();
      toast.success(MENSAJES_ESTADO[estado] || 'Estado actualizado');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Error al cambiar el estado');
    },
  });
}

export function useActualizarTestimonio() {
  const invalidar = useInvalidarTestimonios();
  return useMutation({
    mutationFn: ({ id, ...payload }) => actualizarTestimonio(id, payload),
    onSuccess: () => {
      invalidar();
      toast.success('Testimonio actualizado');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Error al actualizar el testimonio');
    },
  });
}

export function useEliminarTestimonio() {
  const invalidar = useInvalidarTestimonios();
  return useMutation({
    mutationFn: eliminarTestimonio,
    onSuccess: () => {
      invalidar();
      toast.success('Testimonio eliminado');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Error al eliminar el testimonio');
    },
  });
}
