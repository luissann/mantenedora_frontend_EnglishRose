import { create } from 'zustand';

const useSystemStatusStore = create((set) => ({
  backendCaido: false,
  marcarCaido: () => set({ backendCaido: true }),
  marcarRecuperado: () => set({ backendCaido: false }),
}));

export default useSystemStatusStore;
