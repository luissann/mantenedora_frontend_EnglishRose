import { useQuery, useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { getWhatsappEstado, reiniciarWhatsapp } from '../api/whatsapp';

// `watching`: true cuando hay alguien mirando el modal/QR activamente (ahí
// sí conviene sondear rápido). El Topbar lo tiene montado SIEMPRE en toda
// la app con watching=false — pollear cada 3-15s ahí de forma constante es
// lo que agotaba el rate limit global con solo tener la pestaña abierta.
export function useWhatsappEstado(enabled = true, watching = false) {
  return useQuery({
    queryKey: ['whatsapp-estado'],
    queryFn:  getWhatsappEstado,
    enabled,
    refetchInterval: (data) => {
      const estado = data?.data;
      if (watching) {
        // Mirando el QR: pollear rápido (3s) para verlo aparecer, o cada
        // 15s una vez conectado para notar si se cae mientras se mira.
        return estado?.listo ? 15000 : 3000;
      }
      // En segundo plano (ícono del Topbar): mucho más espaciado, ya que
      // solo necesita detectar una desconexión, no verla al instante.
      return estado?.listo ? 60000 : 15000;
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
