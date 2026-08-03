import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { PageHeader } from '../../components/shared/PageHeader';
import { crearAlumnoCompleto } from '../../api/alumnos';
import { AlumnoForm } from './AlumnoForm';

const horarioSchema = z.object({
  id: z.union([z.number(), z.string()]).optional(),
  dia_semana: z.string().min(1, 'Día requerido'),
  hora_inicio: z.string().min(1, 'Hora de inicio requerida'),
  hora_fin: z.string().optional(),
  detalle: z.string().optional(),
});

const programaSchema = z
  .object({
    id: z.union([z.number(), z.string()]).optional(),
    id_programa: z.string().min(1, 'Programa requerido'),
    id_profesor: z.string().optional(),
    frecuencia: z.coerce.number().min(1, 'Mínimo 1 clase por semana').max(7, 'Máximo 7 clases por semana'),
    valor_clase_clp: z.coerce.number().min(0, 'Valor por clase requerido'),
    horarios: z.array(horarioSchema).default([]),
  })
  .superRefine((data, ctx) => {
    if ((data.horarios || []).length > Number(data.frecuencia || 0)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['horarios'],
        message: `Cargaste ${data.horarios.length} horario(s) pero la frecuencia definida es ${data.frecuencia}.`,
      });
    }
  });

const schema = z.object({
  nombre: z.string().min(1, 'El nombre es requerido'),
  alias: z.string().optional(),
  usar_alias_mensaje: z.boolean().optional(),
  telefono: z.string().min(1, 'Teléfono requerido'),
  email: z.string().email('Correo inválido').optional().or(z.literal('')),
  activo: z.boolean(),
  fecha_ingreso: z.date().or(z.string()),
  observaciones: z.string().optional(),
  dia_envio_mensaje: z.string().optional(),
  hora_envio_mensaje: z.string().optional(),
  programas: z.array(programaSchema).max(3, 'Máximo 3 programas por estudiante'),
});

export default function AlumnoNuevoPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    control,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      nombre: '',
      alias: '',
      usar_alias_mensaje: true,
      telefono: '',
      email: '',
      activo: true,
      fecha_ingreso: new Date(),
      observaciones: '',
      dia_envio_mensaje: 'LUNES',
      hora_envio_mensaje: '09:00',
      programas: [],
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      let fechaFormateada = values.fecha_ingreso;
      if (values.fecha_ingreso instanceof Date) {
        fechaFormateada = values.fecha_ingreso.toISOString().split('T')[0];
      }

      const res = await crearAlumnoCompleto({
        nombre: values.nombre,
        alias: values.alias || null,
        usar_alias_mensaje: values.usar_alias_mensaje !== false,
        telefono: values.telefono,
        email: values.email || null,
        activo: !!values.activo,
        fecha_ingreso: fechaFormateada,
        observaciones: values.observaciones || null,
        dia_envio_mensaje: values.dia_envio_mensaje || null,
        hora_envio_mensaje: values.hora_envio_mensaje || '09:00',
        programas: (values.programas || []).map((programa) => ({
          id_programa: Number(programa.id_programa),
          id_profesor: programa.id_profesor ? Number(programa.id_profesor) : null,
          frecuencia: Number(programa.frecuencia),
          valor_clase_clp: Number(programa.valor_clase_clp),
          horarios: (programa.horarios || []).map((horario) => ({
            dia_semana: horario.dia_semana,
            hora_inicio: horario.hora_inicio,
            hora_fin: horario.hora_fin || undefined,
            detalle: horario.detalle || null,
          })),
        })),
      });
      const idAlumno = res?.data?.id;

      queryClient.invalidateQueries({ queryKey: ['alumnos'] });
      toast.success('Estudiante creado exitosamente');
      navigate(`/alumnos/${idAlumno}`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al crear estudiante');
    }
  });

  return (
    <div className="space-y-6">
      <PageHeader title="Crear Estudiante" />
      <AlumnoForm
        control={control}
        register={register}
        watch={watch}
        setValue={setValue}
        errors={errors}
        onSubmit={onSubmit}
        onCancel={() => navigate('/alumnos')}
        submitting={isSubmitting}
        submitLabel="Guardar Estudiante"
      />
    </div>
  );
}
