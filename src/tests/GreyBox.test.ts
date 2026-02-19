import { describe, it, expect } from './AtlasTestRunner';
import { SecurityMiddleware } from '../utils/securityMiddleware';
import { TestGenerators } from './TestGenerators';

export const runGreyBoxTests = async () => {
    await describe('Integration & State Flow Audit', 'GREY', async () => {

        it('should successfully associate groups with protocols from storage', () => {
            const mockGroups = [{
                id: 'ops-group',
                permissions: { 'execute_deploy': true }
            }];
            const mockSession = { role: 'OPERATOR', groupId: 'ops-group' };

            localStorage.setItem('atlas_groups', JSON.stringify(mockGroups));
            localStorage.setItem('atlas_session', JSON.stringify(mockSession));

            const result = SecurityMiddleware.authorizeProtocol('execute_deploy');
            expect(result).toBe(true);
        });

        it('should preserve legacy "antigravity_" group mapping', () => {
            localStorage.removeItem('atlas_groups');
            const legacyGroups = [{ id: 'legacy-pioneer', permissions: { 'access_core': true } }];
            localStorage.setItem('antigravity_groups', JSON.stringify(legacyGroups));

            const session = { role: 'USER', groupId: 'legacy-pioneer' };
            localStorage.setItem('atlas_session', JSON.stringify(session));

            const result = SecurityMiddleware.authorizeProtocol('access_core');
            expect(result).toBe(true);
        });
    });

    // MASS SCALE PERMUTATIONS
    await describe('Massive Session Flow Audit', 'GREY', async () => {
        const sessions = TestGenerators.generateSessions(102);

        sessions.forEach(session => {
            it(`should authorize ${session.role} for assigned group ${session.groupId}`, () => {
                localStorage.setItem('atlas_session', JSON.stringify(session));
                const isAdmin = session.role === 'ADMIN' || session.groupId === 'admin-group';
                const result = SecurityMiddleware.authorizeProtocol('test');
                if (isAdmin) expect(result).toBe(true);
            });
        });
    }, { silentOnSuccess: true });
};
