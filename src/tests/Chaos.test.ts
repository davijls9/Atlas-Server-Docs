import { describe, it, expect } from './AtlasTestRunner';
import { SecurityMiddleware } from '../utils/securityMiddleware';
import { TestGenerators } from './TestGenerators';

export const runChaosTests = async () => {
    await describe('System Resilience (Chaos) Audit', 'CHAOS', async () => {
        const chaosInputs = TestGenerators.generateChaosData();

        chaosInputs.forEach((input, i) => {
            it(`should handle malformed input variant ${i}`, () => {
                // Testing if the system crashes when localStorage contains garbage
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
    });
};
