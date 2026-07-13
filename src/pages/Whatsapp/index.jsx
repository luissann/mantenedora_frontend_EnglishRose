import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, ChevronRight, Edit, Trash2, Plus, MessageCircle } from 'lucide-react';
import { PageHeader } from '../../components/shared/PageHeader';
import { Button } from '../../components/ui/Button';
import { SearchBar } from '../../components/ui/SearchBar';
import { Badge } from '../../components/ui/Badge';
import { EmptyState } from '../../components/shared/EmptyState';
import { ConfirmDialog } from '../../components/shared/ConfirmDialog';
import { Spinner } from '../../components/ui/Spinner';
import { useProgramacionMensajes, useEliminarProgramacionMensaje } from '../../hooks/useProgramacionMensajes';
import { useAlumnos } from '../../hooks/useAlumnos';
import { formatDate, formatTime } from '../../utils/formatters';

function estadoDeEnvio(row) {
  if (row.estado_envio === 'ENVIADO') return 'Enviado';
  if (row.estado_envio === 'FALLIDO') return 'Fallido';
  if (!row.activo) return 'Inactive';

  const hoy = new Date().toISOString().split('T')[0];
  if (row.fecha_envio < hoy) return 'VENCIDO';

  return 'Programado';
}

export default function WhatsappIndexPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [expandidos, setExpandidos] = useState(new Set());
  const [deleteId, setDeleteId] = useState(null);

  const { data: programacionesData, isLoading } = useProgramacionMensajes({ limit: 100 });
  const { data: alumnosData } = useAlumnos({ limit: 1000 });
  const deleteMutation = useEliminarProgramacionMensaje();

  const programaciones = programacionesData?.data || [];
  const alumnosPorId = new Map((alumnosData?.data || []).map((alumno) => [String(alumno.id), alumno]));

  const grupos = useMemo(() => {
    const porAlumno = new Map();

    for (const row of programaciones) {
      const key = String(row.id_alumno);
      if (!porAlumno.has(key)) {
        const alumno = alumnosPorId.get(key);
        const nombreCompleto = [alumno?.nombre, alumno?.segundo_nombre, alumno?.apellido, alumno?.segundo_apellido]
          .filter(Boolean)
          .join(' ') || row.nombre || 'Sin alumno';
        porAlumno.set(key, { idAlumno: key, nombreCompleto, items: [] });
      }
      porAlumno.get(key).items.push(row);
    }

    const lista = Array.from(porAlumno.values());

    for (const grupo of lista) {
      grupo.items.sort((a, b) => `${a.fecha_envio}${a.hora_envio}`.localeCompare(`${b.fecha_envio}${b.hora_envio}`));
    }

    const filtrada = search.trim()
      ? lista.filter((g) => g.nombreCompleto.toLowerCase().includes(search.trim().toLowerCase()))
      : lista;

    return filtrada.sort((a, b) =>
      `${a.items[0]?.fecha_envio}${a.items[0]?.hora_envio}`.localeCompare(`${b.items[0]?.fecha_envio}${b.items[0]?.hora_envio}`)
    );
  }, [programaciones, alumnosPorId, search]);

  const toggleExpandido = (idAlumno) => {
    setExpandidos((prev) => {
      const next = new Set(prev);
      next.has(idAlumno) ? next.delete(idAlumno) : next.add(idAlumno);
      return next;
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Programación de WhatsApp" />
      <div className="flex flex-wrap items-center gap-3">
        <Button variant="primary" leftIcon={<Plus className="h-4 w-4" />} onClick={() => navigate('/whatsapp/nuevo')}>
          Nuevo Mensaje
        </Button>
      </div>

      <div className="grid gap-4">
        <SearchBar value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar alumno..." />
      </div>

      {isLoading ? (
        <div className="flex h-80 items-center justify-center">
          <Spinner size="lg" />
        </div>
      ) : grupos.length === 0 ? (
        <EmptyState title="No se encontraron mensajes programados" actionLabel="Crear Mensaje" onAction={() => navigate('/whatsapp/nuevo')} />
      ) : (
        <div className="space-y-3">
          {grupos.map((grupo) => {
            const abierto = expandidos.has(grupo.idAlumno);
            const proximo = grupo.items[0];

            return (
              <div key={grupo.idAlumno} className="overflow-hidden rounded-3xl border border-border bg-white shadow-sm">
                <button
                  type="button"
                  onClick={() => toggleExpandido(grupo.idAlumno)}
                  className="flex w-full items-center gap-4 px-5 py-4 text-left hover:bg-rose-light/20"
                >
                  {abierto ? (
                    <ChevronDown className="h-4 w-4 shrink-0 text-text-secondary" />
                  ) : (
                    <ChevronRight className="h-4 w-4 shrink-0 text-text-secondary" />
                  )}

                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-rose-light text-rose">
                    <MessageCircle className="h-5 w-5" />
                  </span>

                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-text-primary">{grupo.nombreCompleto}</span>
                    <span className="block text-xs text-text-secondary">
                      Próximo envío: {formatDate(proximo.fecha_envio)} · {formatTime(proximo.hora_envio)}
                    </span>
                  </span>

                  <span className="shrink-0 rounded-full bg-rose-light px-3 py-1 text-xs font-semibold text-rose">
                    {grupo.items.length} programado{grupo.items.length === 1 ? '' : 's'}
                  </span>
                </button>

                {abierto && (
                  <div className="border-t border-border">
                    {grupo.items.map((row) => (
                      <div
                        key={row.id}
                        className="flex flex-wrap items-center gap-3 border-b border-border px-5 py-3 pl-16 last:border-b-0 text-sm"
                      >
                        <span className="w-28 shrink-0 text-text-primary">{formatDate(row.fecha_envio)}</span>
                        <span className="w-16 shrink-0 text-text-secondary">{formatTime(row.hora_envio)}</span>
                        <span className="shrink-0">
                          <Badge status={estadoDeEnvio(row)} />
                        </span>
                        <span className="ml-auto flex shrink-0 gap-2">
                          <button onClick={() => navigate(`/whatsapp/${row.id}/editar`)} className="text-amber-600 hover:text-amber-800">
                            <Edit className="h-4 w-4" />
                          </button>
                          <button onClick={() => setDeleteId(row.id)} className="text-red-600 hover:text-red-800">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <ConfirmDialog
        isOpen={!!deleteId}
        title="Eliminar Mensaje"
        message="¿Estás seguro de que deseas eliminar este mensaje?"
        onConfirm={() => {
          deleteMutation.mutate(deleteId);
          setDeleteId(null);
        }}
        onCancel={() => setDeleteId(null)}
        loading={deleteMutation.isPending}
      />
    </div>
  );
}
