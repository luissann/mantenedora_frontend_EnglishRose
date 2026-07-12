import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { getConfiguracionSistema, actualizarConfiguracionSistema } from '../api/configuracionSistema';

export function useConfiguracionSistema() {
  return useQuery({
    queryKey: ['configuracion-sistema'],
    queryFn: getConfiguracionSistema,
  });
}

export function useActualizarConfiguracionSistema() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: actualizarConfiguracionSistema,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['configuracion-sistema'] });
      toast.success('Configuración actualizada');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Error al actualizar la configuración');
    },
  });
}
