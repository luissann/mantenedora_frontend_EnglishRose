import { useQuery, useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { getWhatsappEstado, reiniciarWhatsapp } from '../api/whatsapp';

export function useWhatsappEstado(enabled = true) {
  return useQuery({
    queryKey: ['whatsapp-estado'],
    queryFn:  getWhatsappEstado,
    enabled,
    refetchInterval: (data) => {
      // Si no está listo, pollear rápido (3s) para ver el QR nuevo.
      // Si está conectado, pollear lento (15s) para detectar si se desconecta.
      const estado = data?.data;
      if (!estado?.listo) return 3000;
      return 15000;
    },
    staleTime: 0,
  });
}

export function useReiniciarWhatsapp() {
  return useMutation({
    mutationFn: reiniciarWhatsapp,
    onSuccess: () => {
      toast.success('Sesión de WhatsApp reiniciada. Escanea el nuevo QR.');
    },
    onError: () => {
      toast.error('Error al reiniciar la sesión de WhatsApp.');
    },
  });
}
