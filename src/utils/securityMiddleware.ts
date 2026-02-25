export class SecurityMiddleware {
    /**
     * securely writes data to local storage with validation
     */
    /**
     * securely writes data to local storage and syncs with server
     */
    static secureWrite(key: string, value: string): void {
        try {
            // 1. Update Local Cache for immediate UI reactivity
            localStorage.setItem(key, value);

            // 2. Async Sync with Server
            fetch(`/api/persist/${key}`, {
                method: 'POST',
                body: value
            }).catch(e => console.error(`[SECURITY] Push to cluster failed for ${key}:`, e));

        } catch (e) {
            console.error('[SECURITY] Write violation:', e);
        }
    }

    /**
     * Pulls all persisted data from the server to synchronize the local environment
     */
    static async hydrateFromServer(): Promise<boolean> {
        try {
            console.log('[SECURITY] Synchronizing with cluster storage...');
            const response = await fetch('/api/persist/all');
            if (!response.ok) return false;

            const allData = await response.json();
            Object.entries(allData).forEach(([key, value]) => {
                if (typeof value === 'string') {
                    localStorage.setItem(key, value);
                }
            });
            console.log('[SECURITY] Context synchronized successfully');
            return true;
        } catch (e) {
            console.error('[SECURITY] Hydration failed:', e);
            return false;
        }
    }

    /**
     * Validates if the current user can execute a specific protocol
     */
    static authorizeProtocol(protocol: string, userPermissions?: any): boolean {
        // If permissions are provided directly (usually from App.tsx current calculation)
        if (userPermissions) {
            return userPermissions[protocol] === true;
        }

        // Fallback: Try to calculate from session + groups if permissions not passed
        const session = localStorage.getItem('atlas_session');
        if (!session) return false;

        try {
            if (!session || session === 'undefined' || session === 'null') return false;

            const user = JSON.parse(session);
            if (!user || typeof user !== 'object') return false;

            // ADMIN Role Bypass
            if (user.role === 'ADMIN' || user.groupId === 'admin-group') return true;

            const savedGroups = localStorage.getItem('atlas_groups') || localStorage.getItem('antigravity_groups');
            if (!savedGroups) return false;

            const groups = JSON.parse(savedGroups);
            if (!Array.isArray(groups)) return false;

            const group = groups.find((g: any) => g && g.id === user.groupId);
            return group?.permissions?.[protocol] === true;
        } catch (e) {
            console.error('[SECURITY] Authorization violation/error:', e);
            return false;
        }
    }

    /**
     * Validates SSDLC Compliance for a specific component or module
     */
    static validateSSDLCCompliance(protocol: string): { status: 'SECURE' | 'AT_RISK' | 'FAILED', score: number } {
        // Mock SSDLC validation logic - in a real system this would call a security scanner API
        const complianceMap: Record<string, number> = {
            'view_editor': 98,
            'view_map': 95,
            'view_security': 100,
            'view_docs': 92,
            'view_security_intel': 100,
            'manage_users': 100
        };

        const score = complianceMap[protocol] || 85;
        return {
            status: score >= 95 ? 'SECURE' : score >= 80 ? 'AT_RISK' : 'FAILED',
            score
        };
    }
}
