import { useState, useRef, useEffect, useCallback } from 'react';

/**
 * Hook for managing user session and authentication state
 */
export const useAppSession = (showToast: (msg: string, type?: any) => void) => {
    const [currentUser, setCurrentUser] = useState<any>(null);
    const userRef = useRef<any>(null);

    // Keep ref in sync for use in callbacks that need the latest user without being in dependencies
    useEffect(() => {
        userRef.current = currentUser;
    }, [currentUser]);

    const handleLogout = useCallback(() => {
        localStorage.removeItem('atlas_session');
        setCurrentUser(null);
        showToast('Logged out successfully', 'info');
    }, [showToast]);

    const loadSession = useCallback(() => {
        const session = localStorage.getItem('atlas_session');
        if (session) {
            try {
                const user = JSON.parse(session);
                if (user && !user.id) user.id = user.email || 'anonymous';
                setCurrentUser(user);
                return user;
            } catch (e) {
                console.error('Session parse error', e);
                localStorage.removeItem('atlas_session');
            }
        }
        return null;
    }, []);

    return {
        currentUser,
        setCurrentUser,
        userRef,
        handleLogout,
        loadSession
    };
};
