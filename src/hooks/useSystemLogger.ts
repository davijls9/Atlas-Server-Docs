import { useState, useCallback } from 'react';
import type { LogEntry } from '../types/app.types';
import { SecurityMiddleware } from '../utils/securityMiddleware';

/**
 * Hook for managing system logs with persistence
 */
export const useSystemLogger = (userRef: React.MutableRefObject<any>) => {
    const [logs, setLogs] = useState<LogEntry[]>([]);

    const logEvent = useCallback((level: LogEntry['level'], message: string, source: string, details?: any) => {
        const user = userRef.current;
        const newEntry: LogEntry = {
            id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            timestamp: new Date().toISOString(),
            level,
            message,
            source,
            details: {
                ...details,
                user: user?.name || 'Authorized System',
                userId: user?.id || 'sys',
                role: user?.role || 'SYSTEM'
            }
        };

        setLogs(prevLogs => {
            const updatedLogs = [newEntry, ...prevLogs].slice(0, 1000);
            SecurityMiddleware.secureWrite('atlas_system_logs', JSON.stringify(updatedLogs));
            return updatedLogs;
        });
    }, [userRef]);

    const loadLogs = useCallback(() => {
        const savedLogs = localStorage.getItem('atlas_system_logs');
        if (savedLogs) {
            try {
                let parsed = JSON.parse(savedLogs);
                // Guard: handle double-stringified case (parsed is still a string)
                if (typeof parsed === 'string') {
                    parsed = JSON.parse(parsed);
                }
                // Guard: ensure it's actually an array
                if (!Array.isArray(parsed)) {
                    console.warn('[LOGGER] Logs data is not an array, resetting.');
                    setLogs([]);
                    return [];
                }
                setLogs(parsed);
                return parsed;
            } catch (e) {
                console.error('Log load error', e);
                setLogs([]);
            }
        }
        return [];
    }, []);

    return { logs, setLogs, logEvent, loadLogs };
};
