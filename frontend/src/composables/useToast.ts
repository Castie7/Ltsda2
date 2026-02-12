import { ref } from 'vue';

export interface Toast {
    id: number;
    message: string;
    type: 'success' | 'error' | 'warning' | 'info';
    duration: number;
}

const toasts = ref<Toast[]>([]);
let nextId = 0;

export function useToast() {
    const addToast = (message: string, type: Toast['type'] = 'info', duration = 3500) => {
        const id = nextId++;
        toasts.value.push({ id, message, type, duration });

        setTimeout(() => {
            removeToast(id);
        }, duration);
    };

    const removeToast = (id: number) => {
        toasts.value = toasts.value.filter(t => t.id !== id);
    };

    const success = (msg: string) => addToast(msg, 'success');
    const error = (msg: string) => addToast(msg, 'error', 5000);
    const warning = (msg: string) => addToast(msg, 'warning', 4000);
    const info = (msg: string) => addToast(msg, 'info');

    return { toasts, addToast, removeToast, success, error, warning, info };
}
