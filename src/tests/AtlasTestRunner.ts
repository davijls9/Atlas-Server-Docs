/**
 * ATLAS TEST RUNNER (CORE ENGINE)
 * Comprehensive Internal Testing Infrastructure
 */

export type TestResult = {
    name: string;
    passed: boolean;
    error?: any;
    duration: number;
    type: 'BLACK' | 'WHITE' | 'GREY' | 'PERF' | 'STRESS' | 'CHAOS';
    isBatch?: boolean;
};

class AtlasTestRunner {
    private results: TestResult[] = [];
    private currentSuite: string = '';
    private currentType: TestResult['type'] = 'WHITE';
    private isSilentOnSuccess: boolean = false;
    private batchCount: number = 0;
    private batchPass: number = 0;

    private async logToTerminal(message: string) {
        // In dev mode, we send logs to a special Vite middleware that prints to the Node terminal
        if (import.meta.env.DEV) {
            console.log(message); // Still log to browser
            try {
                await fetch('/__atlas_log', {
                    method: 'POST',
                    body: JSON.stringify({ message }),
                    headers: { 'Content-Type': 'application/json' }
                });
            } catch (e) {
                // Silent fail if middleware is not active
            }
        }
    }

    async describe(name: string, type: TestResult['type'], fn: () => void | Promise<void>, options?: { silentOnSuccess?: boolean }) {
        this.currentSuite = name;
        this.currentType = type;
        this.isSilentOnSuccess = options?.silentOnSuccess || false;
        this.batchCount = 0;
        this.batchPass = 0;

        const msg = `\n[SUITE] ${name} (${type} BOX)`;
        await this.logToTerminal(`\x1b[36m${msg}\x1b[0m`);

        const result = fn();
        if (result instanceof Promise) {
            await result;
        }

        if (this.isSilentOnSuccess && this.batchCount > 0) {
            const color = this.batchPass === this.batchCount ? '\x1b[32m' : '\x1b[31m';
            await this.logToTerminal(`  ${color}BATCH RESULTS: ${this.batchPass}/${this.batchCount} PASSED\x1b[0m`);
        }
    }

    async it(name: string, fn: () => void | Promise<void>) {
        const start = performance.now();
        const fullName = `${this.currentSuite} > ${name}`;
        this.batchCount++;

        try {
            const result = fn();
            if (result instanceof Promise) {
                await result;
            }
            const duration = performance.now() - start;
            this.results.push({
                name: fullName,
                passed: true,
                duration,
                type: this.currentType
            });
            this.batchPass++;

            if (!this.isSilentOnSuccess) {
                const perfMsg = this.currentType === 'PERF' ? ` \x1b[90m(${duration.toFixed(2)}ms)\x1b[0m` : '';
                await this.logToTerminal(`  \x1b[32m✓\x1b[0m \x1b[90m${name}${perfMsg}\x1b[0m`);
            }
        } catch (error) {
            const duration = performance.now() - start;
            this.results.push({
                name: fullName,
                passed: false,
                error,
                duration,
                type: this.currentType
            });
            await this.logToTerminal(`  \x1b[31m✗ ${name}\x1b[0m`);
            const errorMessage = error instanceof Error ? error.message : String(error);
            await this.logToTerminal(`    \x1b[31mError:\x1b[0m ${errorMessage}`);
        }
    }

    expect(actual: any) {
        return {
            toBe: (expected: any) => {
                if (actual !== expected) {
                    throw new Error(`Expected ${expected}, but got ${actual}`);
                }
            },
            toContain: (item: any) => {
                if (!actual.includes(item)) {
                    throw new Error(`Expected array/string to contain ${item}`);
                }
            },
            toBeTruthy: () => {
                if (!actual) {
                    throw new Error(`Expected value to be truthy`);
                }
            },
            toBeDefined: () => {
                if (actual === undefined) {
                    throw new Error(`Expected value to be defined`);
                }
            }
        };
    }

    async report() {
        const passed = this.results.filter(r => r.passed).length;
        const failed = this.results.filter(r => !r.passed).length;
        const total = this.results.length;

        await this.logToTerminal(`\n\x1b[1m-------------------------------------------`);
        await this.logToTerminal(`ATLAS INTERNAL AUDIT COMPLETE`);
        await this.logToTerminal(`TOTAL: ${total} | \x1b[32mPASSED: ${passed}\x1b[0m | \x1b[31mFAILED: ${failed}\x1b[0m`);
        await this.logToTerminal(`-------------------------------------------\x1b[0m\n`);

        if (failed > 0) {
            await this.logToTerminal(`\x1b[33m[WARNING] System integrity verified but with critical logical exceptions.\x1b[0m`);
        } else {
            await this.logToTerminal(`\x1b[32m[SUCCESS] All security perimeters and architectural logic verified.\x1b[0m`);
        }
    }
}

export const runner = new AtlasTestRunner();
export const describe = runner.describe.bind(runner);
export const it = runner.it.bind(runner);
export const expect = runner.expect.bind(runner);
