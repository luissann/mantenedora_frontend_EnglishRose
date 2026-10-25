// Validación de UN horario dentro del formulario de Estudiantes (crear y editar).
// Un día concreto exige hora de inicio; el día ROTATIVO no tiene hora (el estudiante
// la confirma por chat), así que ahí no se pide. Antes la hora era obligatoria
// siempre y el formulario se bloqueaba en silencio al guardar un rotativo.
import { z } from 'zod';
import { DIA_ROTATIVO } from './constants';

export const horarioSchema = z
  .object({
    id: z.union([z.number(), z.string()]).optional(),
    dia_semana: z.string().min(1, 'Día requerido'),
    hora_inicio: z.string().optional(),
    hora_fin: z.string().optional(),
    detalle: z.string().optional(),
  })
  .superRefine((horario, ctx) => {
    if (horario.dia_semana === DIA_ROTATIVO) return;
    if (!horario.hora_inicio) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['hora_inicio'], message: 'Hora de inicio requerida' });
    }
  });
