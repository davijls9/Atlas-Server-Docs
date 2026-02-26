import fs from 'fs';
import path from 'path';
import { promisify } from 'util';

const writeFile = promisify(fs.writeFile);
const readFile = promisify(fs.readFile);
const rename = promisify(fs.rename);
const mkdir = promisify(fs.mkdir);

export interface StorageConnector {
    read(key: string): Promise<string | null>;
    write(key: string, value: string): Promise<boolean>;
    listKeys(): Promise<string[]>;
}

class FileConnector implements StorageConnector {
    private dataDir = path.join(process.cwd(), 'server', 'data');

    private async ensureDir() {
        if (!fs.existsSync(this.dataDir)) {
            await mkdir(this.dataDir, { recursive: true });
        }
    }

    async read(key: string): Promise<string | null> {
        try {
            await this.ensureDir();
            const filePath = path.join(this.dataDir, `${key}.json`);
            if (!fs.existsSync(filePath)) return null;
            return await readFile(filePath, 'utf-8');
        } catch {
            return null;
        }
    }

    async write(key: string, value: string): Promise<boolean> {
        try {
            await this.ensureDir();
            const filePath = path.join(this.dataDir, `${key}.json`);
            const tempPath = `${filePath}.tmp`;
            await writeFile(tempPath, value, 'utf-8');
            await rename(tempPath, filePath);
            return true;
        } catch {
            return false;
        }
    }

    async listKeys(): Promise<string[]> {
        try {
            await this.ensureDir();
            const files = await promisify(fs.readdir)(this.dataDir);
            return files.filter(f => f.endsWith('.json')).map(f => f.replace('.json', ''));
        } catch {
            return [];
        }
    }
}

/**
 * Stub for future SQL implementation
 */
class SQLConnector implements StorageConnector {
    async read(key: string): Promise<string | null> {
        console.warn('[STORAGE] SQL Connector not yet implemented. Falling back to FileSystem.');
        return null;
    }
    async write(key: string, value: string): Promise<boolean> {
        console.warn('[STORAGE] SQL Connector not yet implemented.');
        return false;
    }
    async listKeys(): Promise<string[]> {
        return [];
    }
}

export class PersistenceManager {
    private static connector: StorageConnector = new FileConnector();
    private static writeQueues: Map<string, Promise<void>> = new Map();

    /**
     * Reads data for a given key
     */
    static async read(key: string): Promise<string | null> {
        try {
            const data = await this.connector.read(key);
            if (!data) return null;
            JSON.parse(data); // Validate JSON integrity
            return data;
        } catch {
            console.error(`[PERSISTENCE] Integrity check failed for ${key}`);
            return null;
        }
    }

    /**
     * Writes data for a given key with concurrency protection
     */
    static async write(key: string, value: string): Promise<boolean> {
        const currentQueue = this.writeQueues.get(key) || Promise.resolve();
        const nextWrite = currentQueue.then(async () => {
            try {
                // Pre-write validation
                JSON.parse(value);
                return await this.connector.write(key, value);
            } catch {
                console.error(`[PERSISTENCE] Write violation for ${key}: Invalid JSON`);
                return false;
            }
        });
        this.writeQueues.set(key, nextWrite.then(() => { }));
        return nextWrite;
    }

    /**
     * Lists all available storage keys
     */
    static async listKeys(): Promise<string[]> {
        return await this.connector.listKeys();
    }
}
