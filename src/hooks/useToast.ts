import { useState, useCallback } from 'react';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastState {
    message: string;
    type: ToastType;
}

/**
 * Hook for managing application-wide toast notifications
 */
export const useToast = () => {
    const [toast, setToast] = useState<ToastState | null>(null);

    const showToast = useCallback((message: string, type: ToastType = 'info') => {
        setToast({ message, type });
        // Auto-clear after 3 seconds
        setTimeout(() => setToast(null), 3000);
    }, []);

    const hideToast = useCallback(() => setToast(null), []);

    return { toast, showToast, hideToast };
};
