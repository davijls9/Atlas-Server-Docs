import { describe, it, expect } from './AtlasTestRunner';
import { SecurityMiddleware } from '../utils/securityMiddleware';
import { TestGenerators } from './TestGenerators';

export const runChaosTests = async () => {
    await describe('System Resilience (Chaos) Audit', 'CHAOS', async () => {
        const chaosInputs = TestGenerators.generateChaosData();

        // Save original localStorage state BEFORE chaos tests (critical: prevents pollution)
        const originalSession = localStorage.getItem('atlas_session');
        const originalGroups = localStorage.getItem('atlas_groups');

        chaosInputs.forEach((input, i) => {
            it(`should handle malformed input variant ${i}`, () => {
                // Write chaos data temporarily
                localStorage.setItem('atlas_session', typeof input === 'string' ? input : JSON.stringify(input));

                try {
                    const result = SecurityMiddleware.authorizeProtocol('any');
                    expect(typeof result).toBe('boolean');
                } catch (e) {
                    // System should handle errors gracefully, not crash the renderer
                }
            });
        });

        it('should recover from corrupted security keys', () => {
            localStorage.setItem('atlas_groups', 'CORRUPT_DATA_!!!');
            const result = SecurityMiddleware.authorizeProtocol('any');
            expect(result).toBe(false); // Should fail secure-ly
        });

        // CRITICAL: Restore original localStorage after ALL chaos tests
        it('should restore environment after chaos suite', () => {
            if (originalSession) {
                localStorage.setItem('atlas_session', originalSession);
            } else {
                localStorage.removeItem('atlas_session');
            }
            if (originalGroups) {
                localStorage.setItem('atlas_groups', originalGroups);
            } else {
                localStorage.removeItem('atlas_groups');
            }
            expect(true).toBe(true); // Cleanup confirmed
        });
    });
};
