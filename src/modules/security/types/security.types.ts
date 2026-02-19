// Security Module Type Definitions

export interface Attribute {
    id: string;
    label: string;
    type: 'TEXT' | 'NUMBER' | 'BOOLEAN';
    defaultValue: any;
    appliesTo?: NodeType[];
    enabled?: boolean;
    showInSecurity?: boolean;
}

export type NodeType = 'POP' | 'PHYSICAL_SERVER' | 'VIRTUAL_MACHINE' | 'SWITCH' | 'SYSTEM';

export interface AuditColumn {
    id: string;
    label: string;
    key: string;
}

export interface ComplianceData {
    native: boolean;
    current: boolean;
    value?: any;
    matchStrategy?: 'attrById' | 'attrByLabel' | 'directById' | 'directByKey' | 'fuzzy' | 'none';
}

export interface SecurityNode {
    id: string;
    name: string;
    type: NodeType;
    ip?: string;
    status?: string;
    criticality?: string;
    attributes?: NodeAttribute[];
    compliance?: Record<string, ComplianceData>;
    score: number;
    riskLevel: 'LOW' | 'MEDIUM' | 'CRITICAL';
    processedChildren?: SecurityNode[];
}

export interface NodeAttribute {
    attributeId: string;
    label?: string;
    value: any;
}

export interface SecurityOverrides {
    [key: string]: boolean; // key format: `${nodeId}_${columnKey}`
}

export interface SecurityStats {
    total: number;
    protected_nodes: number;
    critical_gaps: number;
    avgScore: number;
}

export interface AuditReport {
    metadata: {
        title: string;
        timestamp: string;
        generatedBy: string;
        complianceScore: string;
        nodeCount: number;
        correlatedAttributes: AuditColumn[];
    };
    summary: {
        protected: number;
        critical: number;
        overrides: number;
        averageScore: number;
    };
    attributeBreakdown: AttributeBreakdown[];
    assets: AssetReport[];
    overrides: OverrideReport[];
}

export interface AttributeBreakdown {
    attribute: string;
    attributeId: string;
    compliant: number;
    nativeCompliant: number;
    manualOverrides: number;
    total: number;
    complianceRate: string;
}

export interface AssetReport {
    id: string;
    name: string;
    type: string;
    ip: string;
    score: string;
    status: string;
    attributes: Record<string, {
        compliant: boolean;
        value: any;
        native: boolean;
        matchStrategy: string;
        override: boolean;
    }>;
}

export interface OverrideReport {
    nodeId: string;
    nodeName: string;
    attribute: string;
    appliedAt: string;
}

export interface SecurityViewProps {
    jsonData: string;
    showToast?: (message: string, type?: 'success' | 'error' | 'info') => void;
    currentUser: any;
    logEvent: (level: string, message: string, category: string, metadata?: any) => void;
}
