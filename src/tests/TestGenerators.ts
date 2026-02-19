/**
 * ATLAS TEST GENERATORS
 * Utilities for high-scale test data creation
 */

export const TestGenerators = {
    /**
     * Generates a batch of permission permutations
     */
    generatePermissionMatrix(count: number) {
        return Array.from({ length: count }, (_, i) => ({
            protocol: `protocol_${i.toString().padStart(3, '0')}`,
            expectedScore: Math.floor(Math.random() * 40) + 60, // 60-100
        }));
    },

    /**
     * Generates session data permutations
     */
    generateSessions(count: number) {
        const roles = ['USER', 'GUEST', 'OPERATOR', 'AUDITOR'];
        return Array.from({ length: count }, (_, i) => ({
            id: `user_${i}`,
            role: roles[i % roles.length],
            groupId: i % 10 === 0 ? 'admin-group' : `group_${i % 5}`
        }));
    },

    /**
     * Generates malformed data for chaos testing
     */
    generateChaosData() {
        return [
            null,
            undefined,
            '',
            '{ invalid json }',
            '[]',
            '12345',
            '{"role": "ADMIN", "malicious": true}',
            '{"groupId": "../../etc/passwd"}'
        ];
    }
};
