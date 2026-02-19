import { describe, it, expect } from './AtlasTestRunner';
import { SecurityMiddleware } from '../utils/securityMiddleware';

export const runPerformanceTests = async () => {
    await describe('System Latency Audit', 'PERF', async () => {

        it('should validate compliance in < 1ms (target)', () => {
            const start = performance.now();
            SecurityMiddleware.validateSSDLCCompliance('view_editor');
            const duration = performance.now() - start;
            expect(duration < 1).toBe(true);
        });

        it('should authorize protocol in < 0.5ms (target)', () => {
            const mockAdmin = { role: 'ADMIN', groupId: 'any' };
            localStorage.setItem('atlas_session', JSON.stringify(mockAdmin));

            const start = performance.now();
            SecurityMiddleware.authorizeProtocol('sensitive_action');
            const duration = performance.now() - start;
            expect(duration < 0.5).toBe(true);
        });
    });
};
