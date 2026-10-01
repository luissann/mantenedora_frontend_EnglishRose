import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { getSitio, guardarSitio, restaurarSitio } from '../api/sitio';

export function useSitio() {
  return useQuery({
    queryKey: ['sitio'],
    queryFn: getSitio,
    staleTime: 0,
  });
}

export function useGuardarSitio() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ clave, valor }) => guardarSitio(clave, valor),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sitio'] });
      toast.success('Guardado y publicado. Se verá en la web en cerca de 1 minuto.');
    },
    // el detalle de los errores de validación lo muestra la propia pantalla
    onError: (error) => {
      toast.error(error.response?.data?.message || 'No se pudo guardar');
    },
  });
}

export function useRestaurarSitio() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ clave }) => restaurarSitio(clave),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sitio'] });
      toast.success('Sección restaurada al contenido original');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'No se pudo restaurar');
    },
  });
}
