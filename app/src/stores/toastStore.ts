import { create } from 'zustand';

export type ToastTone = 'info' | 'success' | 'error';

export interface Toast {
  id: number;
  message: string;
  tone: ToastTone;
}

interface ToastState {
  toasts: Toast[];
  show: (message: string, tone?: ToastTone) => void;
  dismiss: (id: number) => void;
}

const TOAST_DURATION_MS = 3200;
const MAX_VISIBLE = 3;
let nextId = 1;

/** Short messages shown at the top of the screen (errors from the server, confirmations). */
export const useToastStore = create<ToastState>()((set, get) => ({
  toasts: [],
  show: (message, tone = 'info') => {
    const id = nextId++;
    set({ toasts: [...get().toasts, { id, message, tone }].slice(-MAX_VISIBLE) });
    setTimeout(() => get().dismiss(id), TOAST_DURATION_MS);
  },
  dismiss: (id) => set({ toasts: get().toasts.filter((t) => t.id !== id) }),
}));

export const showToast = (message: string, tone?: ToastTone) =>
  useToastStore.getState().show(message, tone);
