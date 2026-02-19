// Node Types
export type NodeType = 'PHYSICAL_SERVER' | 'VIRTUAL_MACHINE' | 'SWITCH' | 'ROUTER' | 'SYSTEM';

export interface BlueprintAttribute {
    id: string;
    label: string;
    type: 'TEXT' | 'NUMBER' | 'BOOLEAN' | 'DATE' | 'SELECT' | 'LIST'; // Updated to Uppercase to match existing
    required?: boolean; // Optional now
    defaultValue?: any;
    options?: string[]; // For select type
    description?: string;
    isInherited?: boolean;
    // New fields from BlueprintEditor
    appliesTo?: NodeType[];
    enabled?: boolean;
    showInSecurity?: boolean;
}

export interface NodeAttributeValue {
    attributeId: string;
    value: any;
}

export interface NetworkInterface {
    id: string;
    name: string;
    type: 'COPPER' | 'FIBER' | 'VIRTUAL';
    status: 'ACTIVE' | 'INACTIVE';
}

export interface InfraNode {
    id: string;
    type: NodeType;
    name: string;
    ip: string;
    status: 'ON' | 'OFF' | 'MAINTENANCE';
    criticality: 'LOW' | 'MEDIUM' | 'HIGH';
    children?: InfraNode[];
    attributes: NodeAttributeValue[];
    interfaces?: NetworkInterface[];
}

export interface Pop {
    id: string;
    name: string;
    city: string;
    nodes: InfraNode[];
}

export interface Link {
    sourceId: string;
    targetId: string;
    label: string;
    type: 'DATA' | 'BACKBONE' | 'LOGICAL';
    routeName?: string;
    color?: string;
    sourceHandle?: string;
    targetHandle?: string;
    waypoints?: { x: number; y: number }[];
}

export interface BlueprintNodeSchema {
    id: string;
    name: string;
    icon: string; // Icon name e.g. "Server", "Database"
    bgColor: string; // Hex color
    borderColor: string;
    attributes: BlueprintAttribute[];
    allowedConnections: string[]; // IDs of other schema nodes this can connect to for validation
    description?: string;
}

export interface BlueprintSchema {
    id: string; // Blueprint ID
    name: string;
    version: string;
    nodes: BlueprintNodeSchema[];
    globalAttributes: BlueprintAttribute[];
    metadata: {
        createdAt: string;
        updatedAt: string;
        author: string;
    };
}

export interface BlueprintMetadata {
    id: string;
    name: string;
    ownerId: string;
    ownerName: string;
    groupId: string;
    type: 'PERSONAL' | 'SHARED' | 'GLOBAL';
    createdAt: string;
    lastModified: string;
    storageKey: string;
    authorizedUserIds: string[];
    authorizedGroupIds: string[];
}
