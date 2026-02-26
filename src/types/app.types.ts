export interface LogEntry {
    id: string;
    timestamp: string;
    level: 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';
    source: string;
    message: string;
    details?: any;
}

export interface BlueprintMetadata {
    id: string;
    name: string;
    ownerId: string;
    ownerName: string;
    groupId: string;
    type: 'GLOBAL' | 'PERSONAL' | 'SHARED';
    createdAt: string;
    lastModified: string;
    storageKey: string;
    authorizedUserIds?: string[];
    authorizedGroupIds?: string[];
}

export type AppTab = 'editor' | 'map' | 'data' | 'security' | 'workspace' | 'docs' | 'profile' | 'logs';
