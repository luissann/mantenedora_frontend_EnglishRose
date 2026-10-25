// Cuando el formulario no pasa la validación NO se envía nada al servidor. En un
// formulario largo el resumen de errores queda arriba y la persona, parada en el
// botón Guardar al final, no ve ningún cambio ("le di guardar y no pasó nada").
// Esto avisa con un mensaje y, si ningún campo recibió el foco (react-hook-form lo
// manda al primer campo con error, y ahí ya se ve el problema), sube al resumen.
import { toast } from 'sonner';

export function avisarFormularioInvalido() {
  toast.error('No se guardó: hay campos por revisar (están marcados arriba en el formulario).');
  setTimeout(() => {
    const el = document.activeElement;
    const enCampo = el && el.matches && el.matches('input, select, textarea');
    if (!enCampo) window.scrollTo({ top: 0, behavior: 'smooth' });
  }, 80);
}
