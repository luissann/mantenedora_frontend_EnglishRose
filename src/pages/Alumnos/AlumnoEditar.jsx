import { useEffect, useMemo, useRef } from 'react';
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
import {
  useCrearProgramacionMensaje,
  useActualizarProgramacionMensaje,
} from '../../hooks/useProgramacionMensajes';
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
  alias: z.string().optional(),
  usar_alias_mensaje: z.boolean().optional(),
  telefono: z.string().min(1),
  email: z.string().email('Correo inválido').optional().or(z.literal('')),
  activo: z.boolean(),
  fecha_ingreso: z.date().or(z.string()),
  observaciones: z.string().optional(),
  programas: z.array(programaSchema).max(3, 'Máximo 3 programas por estudiante'),
});

export default function AlumnoEditarPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: alumnoRes, isLoading } = useAlumnoCompleto(id);
  const alumno = alumnoRes?.data;
  const programasOriginalRef = useRef([]);

  const crearProgramacionMutation = useCrearProgramacionMensaje();
  const actualizarProgramacionMutation = useActualizarProgramacionMensaje();

  // La programación real (misma tabla que usa el envío masivo y el listado
  // de Estudiantes): la más próxima pendiente, activa o pausada, para
  // mostrarla/editarla directamente — ver ProgramacionRealCard en AlumnoForm.
  const proximaProgramacion = useMemo(() => {
    if (!alumno) return undefined;
    // Preferir SIEMPRE una fila activa por sobre una pausada, aunque la
    // pausada tenga una fecha más antigua: solo la activa es la que
    // realmente se va a enviar y la que el envío masivo mantiene al día. Sin
    // esto, filas pausadas viejas (de pruebas o de un pausado anterior)
    // podían mostrarse como si fueran "la próxima" en vez de la real.
    const pendientes = (alumno.programaciones || [])
      .filter((p) => p.estado_envio === 'PENDIENTE')
      .sort((a, b) => {
        if (a.activo !== b.activo) return a.activo ? -1 : 1;
        // Entre varias activas (no debería pasar) o varias pausadas
        // (debris viejo), la más reciente en tocarse es la que manda —
        // ordenar por fecha_envio entre pausadas puede mostrar una vieja
        // "de museo" en vez de la última real.
        return new Date(b.updated_at || 0) - new Date(a.updated_at || 0);
      });
    return pendientes[0] || null;
  }, [alumno]);

  const guardarProgramacion = (fechaEnvio, horaEnvio) => {
    const fecha = fechaEnvio instanceof Date ? fechaEnvio.toISOString().split('T')[0] : fechaEnvio;
    if (proximaProgramacion) {
      actualizarProgramacionMutation.mutate({ id: proximaProgramacion.id, fecha_envio: fecha, hora_envio: horaEnvio, activo: true });
    } else {
      crearProgramacionMutation.mutate({ id_alumno: id, fecha_envio: fecha, hora_envio: horaEnvio, activo: true });
    }
  };

  const togglePausadoProgramacion = (activo) => {
    if (!proximaProgramacion) return;
    actualizarProgramacionMutation.mutate({ id: proximaProgramacion.id, activo });
  };

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
      alias: alumno.alias ?? '',
      usar_alias_mensaje: alumno.usar_alias_mensaje !== false,
      telefono: alumno.telefono ?? '',
      email: alumno.email ?? '',
      activo: Boolean(alumno.activo),
      fecha_ingreso: alumno.fecha_ingreso ? parseISO(alumno.fecha_ingreso) : new Date(),
      observaciones: alumno.observaciones ?? '',
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
        alias: values.alias || null,
        usar_alias_mensaje: values.usar_alias_mensaje !== false,
        telefono: values.telefono,
        email: values.email || null,
        activo: !!values.activo,
        fecha_ingreso: fechaFormateada,
        observaciones: values.observaciones || null,
      });

      await sincronizarProgramasYHorarios(id, values.programas || [], programasOriginalRef.current);

      queryClient.invalidateQueries({ queryKey: ['alumnos'] });
      queryClient.invalidateQueries({ queryKey: ['alumno'] });
      queryClient.invalidateQueries({ queryKey: ['alumnoCompleto'] });
      toast.success('Estudiante actualizado exitosamente');
      navigate(`/alumnos/${id}`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al actualizar estudiante');
    }
  });

  return (
    <div className="space-y-6">
      <PageHeader title="Editar Estudiante" />
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
        proximaProgramacion={proximaProgramacion}
        onGuardarProgramacion={guardarProgramacion}
        onTogglePausadoProgramacion={togglePausadoProgramacion}
        guardandoProgramacion={crearProgramacionMutation.isPending || actualizarProgramacionMutation.isPending}
      />
    </div>
  );
}
