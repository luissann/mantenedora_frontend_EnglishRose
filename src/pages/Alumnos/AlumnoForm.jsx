import { useFieldArray } from 'react-hook-form';
import { Users, GraduationCap, Trash2, Plus, MessageCircle } from 'lucide-react';
import { FormErrorSummary } from '../../components/shared/FormErrorSummary';
import { DiaSemanaCalendarPicker } from '../../components/shared/DiaSemanaCalendarPicker';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { DatePicker } from '../../components/ui/DatePicker';
import { Toggle } from '../../components/ui/Toggle';
import { Button } from '../../components/ui/Button';
import { useProgramas } from '../../hooks/useProgramas';
import { useProfesores } from '../../hooks/useProfesores';
import { DIAS_DISPLAY } from '../../utils/constants';

const MAX_PROGRAMAS = 3;

function nuevoHorario() {
  return { dia_semana: 'LUNES', hora_inicio: '09:00', hora_fin: '', detalle: '' };
}

function nuevoPrograma() {
  return {
    id_programa: '',
    id_profesor: '',
    frecuencia: 1,
    valor_clase_clp: 0,
    horarios: [],
  };
}

function HorariosDelPrograma({ control, register, watch, setValue, indexPrograma, errors, frecuencia }) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: `programas.${indexPrograma}.horarios`,
  });

  const puedeAgregar = fields.length < Number(frecuencia || 0);
  const errorHorarios = errors?.programas?.[indexPrograma]?.horarios?.message
    || errors?.programas?.[indexPrograma]?.horarios?.root?.message;

  return (
    <Card watermark={false}>
      <h4 className="mb-4 font-semibold text-text-primary">
        Horarios del Programa {indexPrograma + 1}
      </h4>

      {fields.length === 0 ? (
        <p className="mb-4 text-sm text-text-secondary">Aún no hay horarios cargados para este programa.</p>
      ) : (
        <div className="mb-4 overflow-x-auto rounded-2xl border border-border-input">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-rose-light/40 text-xs uppercase tracking-wide text-text-secondary">
              <tr>
                <th className="px-3 py-2">Día</th>
                <th className="px-3 py-2">Hora de inicio</th>
                <th className="px-3 py-2">Hora de término</th>
                <th className="px-3 py-2">Detalle</th>
                <th className="px-3 py-2">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {fields.map((field, indexHorario) => (
                <tr key={field.id} className="border-t border-border-input">
                  <td className="px-3 py-2">
                    <input
                      type="hidden"
                      {...register(`programas.${indexPrograma}.horarios.${indexHorario}.dia_semana`)}
                    />
                    <div className="flex items-center gap-2">
                      <DiaSemanaCalendarPicker
                        compact
                        diaSemana={watch(`programas.${indexPrograma}.horarios.${indexHorario}.dia_semana`)}
                        onChange={(dia) => setValue(
                          `programas.${indexPrograma}.horarios.${indexHorario}.dia_semana`,
                          dia,
                          { shouldValidate: true, shouldDirty: true }
                        )}
                      />
                      <span className="text-xs font-medium text-text-secondary">
                        {DIAS_DISPLAY[watch(`programas.${indexPrograma}.horarios.${indexHorario}.dia_semana`)]}
                      </span>
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="time"
                      {...register(`programas.${indexPrograma}.horarios.${indexHorario}.hora_inicio`)}
                      className="rounded-xl border border-border-input bg-white px-2 py-1.5 text-sm outline-none focus:border-rose"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="time"
                      {...register(`programas.${indexPrograma}.horarios.${indexHorario}.hora_fin`)}
                      className="rounded-xl border border-border-input bg-white px-2 py-1.5 text-sm outline-none focus:border-rose"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="text"
                      placeholder="Ej. con fono, online"
                      {...register(`programas.${indexPrograma}.horarios.${indexHorario}.detalle`)}
                      className="w-36 rounded-xl border border-border-input bg-white px-2 py-1.5 text-sm outline-none focus:border-rose"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <button
                      type="button"
                      onClick={() => remove(indexHorario)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {errorHorarios && <p className="mb-3 text-xs text-red-600">{errorHorarios}</p>}

      <Button
        type="button"
        variant="secondary"
        size="sm"
        leftIcon={<Plus className="h-4 w-4" />}
        disabled={!puedeAgregar}
        onClick={() => append(nuevoHorario())}
      >
        Añadir Horario
      </Button>
      {!puedeAgregar && (
        <p className="mt-2 text-xs text-text-secondary">
          Ya cargaste {fields.length} horario(s), igual a la frecuencia definida ({Number(frecuencia || 0)}). Sube la frecuencia para añadir más.
        </p>
      )}
    </Card>
  );
}

export function AlumnoForm({ control, register, watch, setValue, errors, onSubmit, onCancel, submitting, submitLabel }) {
  const { fields: programasFields, append: appendPrograma, remove: removePrograma } = useFieldArray({
    control,
    name: 'programas',
  });

  const { data: programasData } = useProgramas({ activo: 'true', limit: 100 });
  const { data: profesoresData } = useProfesores({ activo: 'true', limit: 100 });

  const opcionesPrograma = (programasData?.data || []).map((p) => ({ value: String(p.id), label: p.nombre }));
  const opcionesProfesor = (profesoresData?.data || []).map((p) => ({ value: String(p.id), label: `${p.nombre} ${p.apellido}` }));

  const programasWatch = watch('programas') || [];
  const alias = watch('alias');
  const nombre = watch('nombre');

  const nombrePreview = alias?.trim() || nombre?.trim() || 'Alumno';

  const ordenDiasPreview = ['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO', 'DOMINGO'];
  const lineasPreview = programasWatch
    .flatMap((programa) => programa.horarios || [])
    .sort((a, b) => {
      const diff = ordenDiasPreview.indexOf(a.dia_semana) - ordenDiasPreview.indexOf(b.dia_semana);
      return diff !== 0 ? diff : (a.hora_inicio || '').localeCompare(b.hora_inicio || '');
    })
    .map((h) => `${DIAS_DISPLAY[h.dia_semana] || h.dia_semana} ${h.hora_inicio || '--:--'}${h.detalle ? ` (${h.detalle})` : ''}`)
    .join('\n');

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <FormErrorSummary errors={errors} />

      <Card watermark={false}>
        <div className="space-y-6">
          <div className="flex items-center gap-3 text-text-primary">
            <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-rose-light text-rose">
              <Users className="h-4 w-4" />
            </span>
            <h3 className="text-lg font-semibold">Información Personal</h3>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Input label="Primer Nombre" placeholder="Ej: María" {...register('nombre')} error={errors.nombre?.message} />
            <Input label="Alias" placeholder="Ej: Majo (opcional, se usa en el saludo de WhatsApp)" {...register('alias')} error={errors.alias?.message} />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Input label="Segundo Nombre" placeholder="Opcional" {...register('segundo_nombre')} />
            <Input label="Segundo Apellido" placeholder="Opcional" {...register('segundo_apellido')} />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Input label="Primer Apellido" placeholder="Ej: González" {...register('apellido')} error={errors.apellido?.message} />
            <Input label="Teléfono" placeholder="+56 9 1234 5678" {...register('telefono')} error={errors.telefono?.message} />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Input label="Correo Electrónico" type="email" placeholder="correo@ejemplo.com" {...register('email')} error={errors.email?.message} />
            <DatePicker label="Fecha de Ingreso" value={watch('fecha_ingreso')} onChange={(date) => setValue('fecha_ingreso', date)} />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Toggle label="Estado de Actividad" value={watch('activo')} onChange={(value) => setValue('activo', value)} />
          </div>
          <div>
            <label className="text-sm text-text-secondary">Notas</label>
            <textarea
              {...register('observaciones')}
              className="mt-2 w-full rounded-2xl border border-border-input bg-white px-4 py-3 text-sm outline-none transition focus:border-rose focus:ring-2 focus:ring-rose/20"
              rows={3}
              placeholder="Agrega notas sobre el alumno..."
            />
          </div>
        </div>
      </Card>

      <Card watermark={false}>
        <div className="mb-6 flex items-center gap-3 text-text-primary">
          <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-rose-light text-rose">
            <GraduationCap className="h-4 w-4" />
          </span>
          <h3 className="text-lg font-semibold">Detalles Académicos y Financieros</h3>
        </div>

        <div className="space-y-6">
          {programasFields.map((field, index) => (
            <div key={field.id} className="grid gap-4 lg:grid-cols-2">
              <Card watermark={false} className="border-rose-light bg-rose-light/10">
                <div className="mb-4 flex items-center justify-between">
                  <h4 className="font-semibold text-text-primary">Programa {index + 1}</h4>
                  <button
                    type="button"
                    onClick={() => removePrograma(index)}
                    className="text-red-600 hover:text-red-800"
                    aria-label={`Eliminar Programa ${index + 1}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <div className="space-y-4">
                  <Select
                    label="Programa"
                    placeholder="Seleccionar programa..."
                    options={opcionesPrograma}
                    value={watch(`programas.${index}.id_programa`)}
                    onChange={(value) => setValue(`programas.${index}.id_programa`, value)}
                    searchable
                    error={errors.programas?.[index]?.id_programa?.message}
                  />
                  <Select
                    label="Docente"
                    placeholder="Sin docente asignado"
                    options={opcionesProfesor}
                    value={watch(`programas.${index}.id_profesor`)}
                    onChange={(value) => setValue(`programas.${index}.id_profesor`, value)}
                    searchable
                    error={errors.programas?.[index]?.id_profesor?.message}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="Frecuencia (clases/semana)"
                      type="number"
                      min={1}
                      max={7}
                      {...register(`programas.${index}.frecuencia`, { valueAsNumber: true })}
                      error={errors.programas?.[index]?.frecuencia?.message}
                    />
                    <Input
                      label="$ x clase (CLP)"
                      type="number"
                      step="1"
                      {...register(`programas.${index}.valor_clase_clp`, { valueAsNumber: true })}
                      error={errors.programas?.[index]?.valor_clase_clp?.message}
                    />
                  </div>
                </div>
              </Card>

              <HorariosDelPrograma
                control={control}
                register={register}
                watch={watch}
                setValue={setValue}
                indexPrograma={index}
                errors={errors}
                frecuencia={watch(`programas.${index}.frecuencia`)}
              />
            </div>
          ))}

          {errors.programas?.message && (
            <p className="text-xs text-red-600">{errors.programas.message}</p>
          )}

          <Button
            type="button"
            variant="secondary"
            leftIcon={<Plus className="h-4 w-4" />}
            disabled={programasFields.length >= MAX_PROGRAMAS}
            onClick={() => appendPrograma(nuevoPrograma())}
          >
            Nuevo Programa
          </Button>
          {programasFields.length >= MAX_PROGRAMAS && (
            <p className="text-xs text-text-secondary">Un alumno puede tener máximo {MAX_PROGRAMAS} programas activos.</p>
          )}
        </div>
      </Card>

      <Card watermark={false}>
        <div className="mb-4 flex items-center gap-3 text-text-primary">
          <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-rose-light text-rose">
            <MessageCircle className="h-4 w-4" />
          </span>
          <h3 className="text-lg font-semibold">Envío del Mensaje</h3>
        </div>
        <p className="mb-4 text-sm text-text-secondary">
          Un solo mensaje semanal, con el resumen de todos los programas y horarios del alumno. Elige el día y la hora en que se enviará.
        </p>
        <div className="grid gap-4 md:grid-cols-2">
          <DiaSemanaCalendarPicker
            label="Día de Envío"
            diaSemana={watch('dia_envio_mensaje')}
            onChange={(dia) => setValue('dia_envio_mensaje', dia, { shouldValidate: true, shouldDirty: true })}
            error={errors.dia_envio_mensaje?.message}
          />
          <Input
            label="Hora de Envío"
            type="time"
            {...register('hora_envio_mensaje')}
            error={errors.hora_envio_mensaje?.message}
          />
        </div>
      </Card>

      <Card watermark={false}>
        <div className="mb-4 flex items-center gap-3 text-text-primary">
          <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-rose-light text-rose">
            <MessageCircle className="h-4 w-4" />
          </span>
          <h3 className="text-lg font-semibold">Vista previa del mensaje</h3>
        </div>
        <div className="rounded-3xl border border-border bg-[#DCF8C6] p-5 text-text-primary">
          <div className="whitespace-pre-line rounded-2xl bg-white p-4 text-sm leading-6 text-text-secondary">
            {`Holaaa ${nombrePreview}! ¿Confirmamos? 🥰\n\n${lineasPreview || 'Aún no hay horarios cargados.'}`}
          </div>
        </div>
        <p className="mt-3 text-xs text-text-secondary">
          Este mensaje es sólo una vista previa de referencia. El texto real de cada envío se administra
          desde la Programación de WhatsApp en el perfil del alumno.
        </p>
      </Card>

      <div className="flex gap-3 justify-end">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" variant="primary" loading={submitting}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}

export default AlumnoForm;
