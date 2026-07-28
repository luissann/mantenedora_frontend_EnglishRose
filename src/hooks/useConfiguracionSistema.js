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
      // Activar/desactivar o editar el envío masivo reagenda de inmediato a
      // todos los alumnos en el backend — sin esto, el listado de Estudiantes
      // y el calendario del Home seguían mostrando las fechas viejas hasta
      // un refetch por otra vía.
      queryClient.invalidateQueries({ queryKey: ['programacion-mensajes'] });
      queryClient.invalidateQueries({ queryKey: ['programacion-calendario'] });
      // También reagenda la fila de ProgramacionMensaje de cada alumno — sin
      // esto, la ficha de un alumno (useAlumnoCompleto) podía seguir
      // mostrando la fecha individual vieja si ya estaba en caché.
      queryClient.invalidateQueries({ queryKey: ['alumnoCompleto'] });
      queryClient.invalidateQueries({ queryKey: ['alumno'] });
      toast.success('Configuración actualizada');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Error al actualizar la configuración');
    },
  });
}
