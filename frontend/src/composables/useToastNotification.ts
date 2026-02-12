import { useToast } from './useToast';

export function useToastNotification() {
    const { toasts, removeToast } = useToast();

    const icons: Record<string, string> = {
        success: '✅',
        error: '❌',
        warning: '⚠️',
        info: 'ℹ️',
    };

    const bgColors: Record<string, string> = {
        success: 'bg-emerald-50 border-emerald-200 text-emerald-800',
        error: 'bg-red-50 border-red-200 text-red-800',
        warning: 'bg-amber-50 border-amber-200 text-amber-800',
        info: 'bg-blue-50 border-blue-200 text-blue-800',
    };

    return { toasts, removeToast, icons, bgColors };
}
