import type { SecurityNode, AuditColumn, SecurityOverrides, AuditReport, SecurityStats } from '../types/security.types';

/**
 * Build comprehensive audit report
 */
export const buildAuditReport = (
    auditNodes: SecurityNode[],
    auditCols: AuditColumn[],
    overrides: SecurityOverrides,
    stats: SecurityStats,
    currentUser: any
): AuditReport => {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

    return {
        metadata: {
            title: "Strategic Security Audit Manifest",
            timestamp,
            generatedBy: currentUser?.name || 'System',
            complianceScore: `${stats.avgScore}%`,
            nodeCount: stats.total,
            correlatedAttributes: auditCols.map(c => ({ id: c.id, label: c.label, key: c.key }))
        },
        summary: {
            protected: stats.protected_nodes,
            critical: stats.critical_gaps,
            overrides: Object.keys(overrides).length,
            averageScore: stats.avgScore
        },
        attributeBreakdown: auditCols.map(col => {
            const compliantNodes = auditNodes.filter(n => n.compliance?.[col.key]?.current);
            const nativeCompliant = auditNodes.filter(n => n.compliance?.[col.key]?.native);
            const overridden = auditNodes.filter(n => overrides[`${n.id}_${col.key}`]);

            return {
                attribute: col.label,
                attributeId: col.id,
                compliant: compliantNodes.length,
                nativeCompliant: nativeCompliant.length,
                manualOverrides: overridden.length,
                total: stats.total,
                complianceRate: `${Math.round((compliantNodes.length / stats.total) * 100)}%`
            };
        }),
        assets: auditNodes.map(n => ({
            id: n.id,
            name: n.name,
            type: n.type,
            ip: n.ip || 'N/A',
            score: `${n.score}%`,
            status: n.riskLevel,
            attributes: auditCols.reduce((acc, col) => {
                acc[col.label] = {
                    compliant: n.compliance?.[col.key]?.current || false,
                    value: n.compliance?.[col.key]?.value ?? 'N/A',
                    native: n.compliance?.[col.key]?.native || false,
                    matchStrategy: n.compliance?.[col.key]?.matchStrategy || 'none',
                    override: !!overrides[`${n.id}_${col.key}`]
                };
                return acc;
            }, {} as Record<string, any>)
        })),
        overrides: Object.entries(overrides).map(([key]) => {
            const [nodeId, colKey] = key.split('_');
            const node = auditNodes.find(n => n.id === nodeId);
            const col = auditCols.find(c => c.key === colKey);
            return {
                nodeId,
                nodeName: node?.name || 'Unknown',
                attribute: col?.label || colKey,
                appliedAt: 'N/A'
            };
        })
    };
};

/**
 * Download report as JSON file
 */
export const downloadReport = (report: AuditReport, filename?: string): void => {
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename || `security-audit-report-${report.metadata.timestamp}.json`;
    a.click();
    URL.revokeObjectURL(url);
};
