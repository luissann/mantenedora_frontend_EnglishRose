import { Button } from '../ui/Button';

export function ConfirmDialog({ isOpen, title, message, onConfirm, onCancel, loading = false }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-6">
      <div className="w-full max-w-lg rounded-3xl bg-white p-8 shadow-2xl">
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-text-primary">{title}</h3>
          <p className="text-sm text-text-secondary">{message}</p>
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <Button variant="secondary" onClick={onCancel} disabled={loading}>
              Cancelar
            </Button>
            <Button variant="danger" onClick={onConfirm} loading={loading}>
              Confirmar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ConfirmDialog;
