import { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Button } from '../ui/Button';
import { useWhatsappEstado, useReiniciarWhatsapp } from '../../hooks/useWhatsapp';

export function WhatsappModal({ isOpen, onClose }) {
  const { data: waData, isLoading: cargandoWA } = useWhatsappEstado(isOpen);
  const waEstado = waData?.data;
  const reiniciarMutation = useReiniciarWhatsapp();

  const handleReiniciar = async () => {
    await reiniciarMutation.mutateAsync();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative mx-4 w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl text-center">
        {cargandoWA ? (
          <>
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-yellow-100">
              <span className="text-3xl">⏳</span>
            </div>
            <h3 className="text-xl font-semibold text-text-primary mb-2">
              Conectando con WhatsApp...
            </h3>
            <p className="text-text-secondary mb-6 text-sm">
              Espera unos segundos mientras se obtiene el estado.
            </p>
            <div className="h-2 w-full rounded-full bg-rose-light overflow-hidden mb-6">
              <div className="h-full w-1/2 rounded-full bg-rose animate-pulse" />
            </div>
          </>
        ) : waEstado?.listo ? (
          <>
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <span className="text-3xl">✅</span>
            </div>
            <h3 className="text-xl font-semibold text-text-primary mb-2">
              ¡WhatsApp Conectado!
            </h3>
            <p className="text-text-secondary mb-6">
              La sesión de WhatsApp está activa y lista para enviar mensajes.
            </p>
            <div className="flex gap-3 justify-center">
              <Button variant="danger" onClick={handleReiniciar} loading={reiniciarMutation.isPending}>
                Desconectar / Reiniciar
              </Button>
              <Button variant="primary" onClick={onClose}>
                Cerrar
              </Button>
            </div>
          </>
        ) : waEstado?.tieneQR ? (
          <>
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-rose-light">
              <span className="text-3xl">📱</span>
            </div>
            <h3 className="text-xl font-semibold text-text-primary mb-2">
              Conectar WhatsApp
            </h3>
            <p className="text-text-secondary mb-5 text-sm">
              Escanea este código QR desde tu teléfono:<br />
              <strong>WhatsApp → Menú → Dispositivos vinculados → Vincular dispositivo</strong>
            </p>

            <div className="flex justify-center mb-5">
              <div className="rounded-2xl border-2 border-rose/20 p-4 bg-white shadow-inner">
                <QRCodeSVG value={waEstado.qr} size={220} level="M" includeMargin={false} />
              </div>
            </div>

            <p className="text-xs text-text-secondary mb-4">
              El código se actualiza automáticamente. Si expira, se generará uno nuevo.
            </p>
            <div className="flex gap-3 justify-center">
              <Button variant="danger" onClick={handleReiniciar} loading={reiniciarMutation.isPending}>
                Forzar Nuevo QR
              </Button>
              <Button variant="secondary" onClick={onClose}>
                Cerrar
              </Button>
            </div>
          </>
        ) : (
          <>
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-yellow-100">
              <span className="text-3xl">⏳</span>
            </div>
            <h3 className="text-xl font-semibold text-text-primary mb-2">
              Iniciando WhatsApp...
            </h3>
            <p className="text-text-secondary mb-6 text-sm">
              Espera unos segundos mientras se inicializa el servicio de mensajería.
            </p>
            <div className="h-2 w-full rounded-full bg-rose-light overflow-hidden mb-6">
              <div className="h-full w-1/2 rounded-full bg-rose animate-pulse" />
            </div>
            <div className="flex gap-3 justify-center">
              <Button variant="danger" onClick={handleReiniciar} loading={reiniciarMutation.isPending}>
                Reiniciar
              </Button>
              <Button variant="secondary" onClick={onClose}>
                Cerrar
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
