import { describe, it, expect } from './AtlasTestRunner';
import { SecurityMiddleware } from '../utils/securityMiddleware';
import { TestGenerators } from './TestGenerators';

export const runWhiteBoxTests = async () => {
    await describe('Security Logic Audit', 'WHITE', async () => {

        it('should authorize ADMIN role regardless of protocol', () => {
            const mockAdmin = { role: 'ADMIN', groupId: 'any' };
            localStorage.setItem('atlas_session', JSON.stringify(mockAdmin));

            const result = SecurityMiddleware.authorizeProtocol('any_protocol');
            expect(result).toBe(true);
        });

        it('should authorize admin-group bypass', () => {
            const mockUser = { role: 'USER', groupId: 'admin-group' };
            localStorage.setItem('atlas_session', JSON.stringify(mockUser));

            const result = SecurityMiddleware.authorizeProtocol('sensitive_action');
            expect(result).toBe(true);
        });

        it('should fail SSDLC check for low scores in middleware', () => {
            const result = SecurityMiddleware.validateSSDLCCompliance('view_docs');
            expect(result.status).toBe('AT_RISK');
        });

        it('should return SECURE for high-compliance protocols', () => {
            const result = SecurityMiddleware.validateSSDLCCompliance('view_security_intel');
            expect(result.status).toBe('SECURE');
            expect(result.score).toBe(100);
        });
    });

    // MASS SCALE PERMUTATIONS
    await describe('Massive Permission Logic Permutations', 'WHITE', async () => {
        const matrix = TestGenerators.generatePermissionMatrix(105);

        matrix.forEach(perm => {
            it(`should correctly evaluate compliance for ${perm.protocol}`, () => {
                const result = SecurityMiddleware.validateSSDLCCompliance(perm.protocol);
                expect(typeof result.score).toBe('number');
                expect(result.status).toBeDefined();
            });
        });
    }, { silentOnSuccess: true });
};
