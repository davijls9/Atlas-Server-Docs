import type { SecurityNode, AuditColumn, SecurityOverrides, SecurityStats } from '../types/security.types';

/**
 * Calculate compliance score for a single node
 */
export const calculateNodeCompliance = (
    node: any,
    auditCols: AuditColumn[],
    overrides: SecurityOverrides
): { score: number; riskLevel: 'LOW' | 'MEDIUM' | 'CRITICAL'; compliance: any } => {
    let score = 0;
    const colCount = auditCols.length || 1;
    const scorePerCol = 100 / colCount;
    const compliance: any = {};

    auditCols.forEach(col => {
        // Check local override first
        if (overrides[`${node.id}_${col.key}`]) {
            score += scorePerCol;
            compliance[col.key] = { current: true, native: false, override: true };
            return;
        }

        // Check legacy compliance object
        if (node.compliance?.[col.key]?.native) {
            score += scorePerCol;
            compliance[col.key] = { current: true, native: true, ...node.compliance[col.key] };
            return;
        }

        // Check attributes array (New Standard)
        const attr = node.attributes?.find((a: any) => a.attributeId === col.key);
        if (attr && isValueCompliant(attr.value)) {
            score += scorePerCol;
            compliance[col.key] = { current: true, native: true, value: attr.value, matchStrategy: 'attrById' };
            return;
        }

        // Default: Not compliant
        compliance[col.key] = { current: false, native: false };
    });

    const finalScore = Math.round(score);
    const riskLevel = finalScore > 90 ? 'LOW' : finalScore >= 50 ? 'MEDIUM' : 'CRITICAL';

    return { score: finalScore, riskLevel, compliance };
};

/**
 * Calculate overall security statistics
 */
export const calculateSecurityStats = (nodes: SecurityNode[]): SecurityStats => {
    const total = nodes.length;
    const protected_nodes = nodes.filter(n => n.score > 90).length;
    const critical_gaps = nodes.filter(n => n.score < 40).length;
    const avgScore = total > 0 ? Math.round(nodes.reduce((acc, n) => acc + n.score, 0) / total) : 0;

    return { total, protected_nodes, critical_gaps, avgScore };
};

/**
 * Check if a value represents "true" / "active" / "compliant"
 */
export const isValueCompliant = (value: any): boolean => {
    return value === true || value === 1 ||
        (typeof value === 'string' && ['sim', 'yes', 'true', 'ativo', 'active', 'on', 'ligado', '1', 'ok', 'compliant', 'conformidade', 'conforme'].includes(value.toLowerCase().trim()));
};

/**
 * Normalize string for fuzzy matching
 */
export const normalizeString = (str: string): string => {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]/g, '');
};
