import { describe, it, expect } from './AtlasTestRunner';
import { SecurityMiddleware } from '../utils/securityMiddleware';
import { TestGenerators } from './TestGenerators';

export const runBlackBoxTests = async () => {
    await describe('System Perimeter Audit', 'BLACK', async () => {

        it('should enforce "atlas_" or "antigravity_" prefix on secure writes', () => {
            const success = SecurityMiddleware.secureWrite('atlas_test_key', 'valid');
            expect(success).toBe(true);
            expect(localStorage.getItem('atlas_test_key')).toBe('valid');
        });

        it('should handle unmapped protocols with default "AT_RISK" status', () => {
            const result = SecurityMiddleware.validateSSDLCCompliance('non_existent_protocol');
            expect(result.status).toBe('AT_RISK');
            expect(result.score).toBe(85);
        });
    });

    // MASS SCALE PERMUTATIONS
    await describe('Massive Input Perimeter Audit', 'BLACK', async () => {
        const matrix = TestGenerators.generatePermissionMatrix(110);

        matrix.forEach(perm => {
            it(`should return structured response for ${perm.protocol}`, () => {
                const result = SecurityMiddleware.validateSSDLCCompliance(perm.protocol);
                expect(result).toBeDefined();
                expect(result.score >= 0).toBe(true);
            });
        });
    }, { silentOnSuccess: true });
};
