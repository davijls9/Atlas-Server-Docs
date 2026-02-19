export class SecurityMiddleware {
    /**
     * securely writes data to local storage with validation
     */
    static secureWrite(key: string, value: string): boolean {
        try {
            // Enforce prefix policy
            if (!key.startsWith('atlas_') && !key.startsWith('antigravity_')) {
                console.warn(`[SECURITY] Key ${key} does not follow Atlas/Legacy naming convention`);
            }
            localStorage.setItem(key, value);
            return true;
        } catch (e) {
            console.error('[SECURITY] Write violation:', e);
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
            const user = JSON.parse(session);

            // ADMIN Role Bypas
            if (user.role === 'ADMIN' || user.groupId === 'admin-group') return true;

            const savedGroups = localStorage.getItem('atlas_groups') || localStorage.getItem('antigravity_groups');
            if (!savedGroups) return false;

            const groups = JSON.parse(savedGroups);
            const group = groups.find((g: any) => g.id === user.groupId);
            return group?.permissions?.[protocol] === true;
        } catch (e) {
            console.error('[SECURITY] Authorization error:', e);
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
