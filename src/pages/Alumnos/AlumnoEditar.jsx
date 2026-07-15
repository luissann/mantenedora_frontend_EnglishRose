import { useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { parseISO } from 'date-fns';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { PageHeader } from '../../components/shared/PageHeader';
import { Spinner } from '../../components/ui/Spinner';
import { actualizarAlumno } from '../../api/alumnos';
import { useAlumnoCompleto } from '../../hooks/useAlumnos';
import { sincronizarProgramasYHorarios } from '../../utils/alumnoProgramaSync';
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
  nombre: z.string().min(1),
  segundo_nombre: z.string().optional(),
  apellido: z.string().min(1),
  segundo_apellido: z.string().optional(),
  alias: z.string().optional(),
  telefono: z.string().min(1),
  email: z.string().email('Correo inválido').optional().or(z.literal('')),
  activo: z.boolean(),
  fecha_ingreso: z.date().or(z.string()),
  observaciones: z.string().optional(),
  dia_envio_mensaje: z.string().optional(),
  hora_envio_mensaje: z.string().optional(),
  programas: z.array(programaSchema).max(3, 'Máximo 3 programas por alumno'),
});

export default function AlumnoEditarPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: alumnoRes, isLoading } = useAlumnoCompleto(id);
  const alumno = alumnoRes?.data;
  const programasOriginalRef = useRef([]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { programas: [] },
  });

  useEffect(() => {
    if (!alumno) return;

    const programasOriginal = (alumno.programas || []).map((ap) => ({
      id: ap.id,
      horarios: (ap.horarios || []).map((h) => ({ id: h.id })),
    }));
    programasOriginalRef.current = programasOriginal;

    reset({
      nombre: alumno.nombre ?? '',
      segundo_nombre: alumno.segundo_nombre ?? '',
      apellido: alumno.apellido ?? '',
      segundo_apellido: alumno.segundo_apellido ?? '',
      alias: alumno.alias ?? '',
      telefono: alumno.telefono ?? '',
      email: alumno.email ?? '',
      activo: Boolean(alumno.activo),
      fecha_ingreso: alumno.fecha_ingreso ? parseISO(alumno.fecha_ingreso) : new Date(),
      observaciones: alumno.observaciones ?? '',
      dia_envio_mensaje: alumno.dia_envio_mensaje ?? 'LUNES',
      hora_envio_mensaje: alumno.hora_envio_mensaje ? alumno.hora_envio_mensaje.slice(0, 5) : '09:00',
      programas: (alumno.programas || []).map((ap) => ({
        id: ap.id,
        id_programa: ap.id_programa ? String(ap.id_programa) : (ap.programa?.id ? String(ap.programa.id) : ''),
        id_profesor: ap.id_profesor ? String(ap.id_profesor) : '',
        frecuencia: ap.frecuencia ?? 1,
        valor_clase_clp: Number(ap.valor_clase_clp ?? 0),
        horarios: (ap.horarios || []).map((h) => ({
          id: h.id,
          dia_semana: h.dia_semana,
          hora_inicio: h.hora_inicio ? h.hora_inicio.slice(0, 5) : '',
          hora_fin: h.hora_fin ? h.hora_fin.slice(0, 5) : '',
          detalle: h.detalle ?? '',
        })),
      })),
    });
  }, [alumno, reset]);

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  const onSubmit = handleSubmit(async (values) => {
    try {
      let fechaFormateada = values.fecha_ingreso;
      if (values.fecha_ingreso instanceof Date) {
        fechaFormateada = values.fecha_ingreso.toISOString().split('T')[0];
      } else if (typeof values.fecha_ingreso === 'string' && values.fecha_ingreso.includes('T')) {
        fechaFormateada = values.fecha_ingreso.split('T')[0];
      }

      await actualizarAlumno(id, {
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

      await sincronizarProgramasYHorarios(id, values.programas || [], programasOriginalRef.current);

      queryClient.invalidateQueries({ queryKey: ['alumnos'] });
      queryClient.invalidateQueries({ queryKey: ['alumno'] });
      queryClient.invalidateQueries({ queryKey: ['alumnoCompleto'] });
      toast.success('Alumno actualizado exitosamente');
      navigate(`/alumnos/${id}`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al actualizar alumno');
    }
  });

  return (
    <div className="space-y-6">
      <PageHeader title="Editar Alumno" />
      <AlumnoForm
        control={control}
        register={register}
        watch={watch}
        setValue={setValue}
        errors={errors}
        onSubmit={onSubmit}
        onCancel={() => navigate(`/alumnos/${id}`)}
        submitting={isSubmitting}
        submitLabel="Guardar Cambios"
      />
    </div>
  );
}
