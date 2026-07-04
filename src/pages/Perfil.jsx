import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { PageHeader } from '../components/shared/PageHeader';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import useAuthStore from '../store/authStore';
import { useWhatsappEstado, useReiniciarWhatsapp } from '../hooks/useWhatsapp';

export default function PerfilPage() {
  const usuario = useAuthStore((state) => state.usuario);
  const [mostrarQR, setMostrarQR] = useState(false);

  const { data: waData, isLoading: cargandoWA } = useWhatsappEstado(mostrarQR);
  const waEstado = waData?.data;

  const reiniciarMutation = useReiniciarWhatsapp();

  const handleReiniciar = async () => {
    await reiniciarMutation.mutateAsync();
    setMostrarQR(true); // Activar polling para ver el nuevo QR
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Mi Perfil" />

      {/* Información del usuario */}
      <Card watermark>
        <div className="space-y-5">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-text-secondary">Nombre Completo</p>
            <p className="text-lg font-semibold text-text-primary">
              {usuario?.nombre} {usuario?.apellido}
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-text-secondary">Correo Electrónico</p>
            <p className="text-sm text-text-primary">{usuario?.email}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-text-secondary">Rol</p>
            <p className="text-sm text-text-primary capitalize">{usuario?.rol || 'Administrador'}</p>
          </div>
        </div>
      </Card>

      {/* Panel de estado de WhatsApp */}
      <Card>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-text-primary">Conexión de WhatsApp</h3>
              <p className="text-sm text-text-secondary mt-0.5">
                Gestiona la sesión de WhatsApp para el envío automático de mensajes.
              </p>
            </div>

            {/* Indicador de estado */}
            {!cargandoWA && waEstado && (
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${
                  waEstado.listo
                    ? 'bg-green-100 text-green-700'
                    : 'bg-yellow-100 text-yellow-700'
                }`}
              >
                <span className={`h-2 w-2 rounded-full ${waEstado.listo ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'}`} />
                {waEstado.listo ? 'Conectado' : 'Desconectado'}
              </span>
            )}
          </div>

          {/* Botones de acción */}
          <div className="flex flex-wrap gap-3">
            <Button
              variant="secondary"
              onClick={() => setMostrarQR((prev) => !prev)}
            >
              {mostrarQR ? 'Ocultar QR' : 'Ver QR / Conectar'}
            </Button>

            <Button
              variant="danger"
              loading={reiniciarMutation.isPending}
              onClick={handleReiniciar}
            >
              Reiniciar Sesión
            </Button>
          </div>

          {/* Panel de QR expandible */}
          {mostrarQR && (
            <div className="mt-4 rounded-2xl border border-border-input p-6 text-center bg-gray-50">
              {cargandoWA ? (
                <div className="flex flex-col items-center gap-3 py-6">
                  <div className="h-2 w-48 rounded-full bg-rose-light overflow-hidden">
                    <div className="h-full w-1/2 rounded-full bg-rose animate-pulse" />
                  </div>
                  <p className="text-sm text-text-secondary">Consultando estado de WhatsApp...</p>
                </div>
              ) : waEstado?.listo ? (
                <div className="flex flex-col items-center gap-3 py-4">
                  <span className="text-4xl">✅</span>
                  <p className="font-semibold text-green-700">WhatsApp está conectado y activo.</p>
                  <p className="text-sm text-text-secondary">
                    Los mensajes programados se enviarán automáticamente.<br />
                    Para desconectar y escanear un nuevo QR, usa el botón <strong>"Reiniciar Sesión"</strong>.
                  </p>
                </div>
              ) : waEstado?.tieneQR ? (
                <div className="flex flex-col items-center gap-4">
                  <p className="text-sm text-text-secondary">
                    Escanea con tu teléfono:<br />
                    <strong>WhatsApp → Menú → Dispositivos vinculados → Vincular dispositivo</strong>
                  </p>
                  <div className="rounded-2xl border-2 border-rose/20 p-4 bg-white shadow-inner inline-block">
                    <QRCodeSVG
                      value={waEstado.qr}
                      size={200}
                      level="M"
                      includeMargin={false}
                    />
                  </div>
                  <p className="text-xs text-text-secondary">
                    El código se actualiza automáticamente cada 3 segundos.
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3 py-4">
                  <span className="text-4xl">⏳</span>
                  <p className="text-sm text-text-secondary">
                    Iniciando el servicio de WhatsApp... El QR aparecerá en unos segundos.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
