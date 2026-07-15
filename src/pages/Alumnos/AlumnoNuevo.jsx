import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { PageHeader } from '../../components/shared/PageHeader';
import { crearAlumno } from '../../api/alumnos';
import { crearProgramasYHorarios } from '../../utils/alumnoProgramaSync';
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
  nombre: z.string().min(1, 'El primer nombre es requerido'),
  segundo_nombre: z.string().optional(),
  apellido: z.string().min(1, 'El apellido es requerido'),
  segundo_apellido: z.string().optional(),
  alias: z.string().optional(),
  telefono: z.string().min(1, 'Teléfono requerido'),
  email: z.string().email('Correo inválido').optional().or(z.literal('')),
  activo: z.boolean(),
  fecha_ingreso: z.date().or(z.string()),
  observaciones: z.string().optional(),
  dia_envio_mensaje: z.string().optional(),
  hora_envio_mensaje: z.string().optional(),
  programas: z.array(programaSchema).max(3, 'Máximo 3 programas por alumno'),
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
      segundo_nombre: '',
      apellido: '',
      segundo_apellido: '',
      alias: '',
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
    let idAlumno;
    try {
      let fechaFormateada = values.fecha_ingreso;
      if (values.fecha_ingreso instanceof Date) {
        fechaFormateada = values.fecha_ingreso.toISOString().split('T')[0];
      }

      const res = await crearAlumno({
        nombre: values.nombre,
        segundo_nombre: values.segundo_nombre || null,
        apellido: values.apellido,
        segundo_apellido: values.segundo_apellido || null,
        alias: values.alias || null,
        telefono: values.telefono,
        email: values.email || null,
        activo: !!values.activo,
        fecha_ingreso: fechaFormateada,
        observaciones: values.observaciones || null,
        dia_envio_mensaje: values.dia_envio_mensaje || null,
        hora_envio_mensaje: values.hora_envio_mensaje || '09:00',
      });
      idAlumno = res?.data?.id;

      await crearProgramasYHorarios(idAlumno, values.programas || []);

      queryClient.invalidateQueries({ queryKey: ['alumnos'] });
      toast.success('Alumno creado exitosamente');
      navigate(`/alumnos/${idAlumno}`);
    } catch (error) {
      if (idAlumno) {
        toast.error('El alumno se creó pero hubo un error guardando sus programas u horarios. Revisa y completa desde "Editar Alumno".');
        navigate(`/alumnos/${idAlumno}/editar`);
      } else {
        toast.error(error.response?.data?.message || 'Error al crear alumno');
      }
    }
  });

  return (
    <div className="space-y-6">
      <PageHeader title="Crear Alumno" />
      <AlumnoForm
        control={control}
        register={register}
        watch={watch}
        setValue={setValue}
        errors={errors}
        onSubmit={onSubmit}
        onCancel={() => navigate('/alumnos')}
        submitting={isSubmitting}
        submitLabel="Guardar Alumno"
      />
    </div>
  );
}
