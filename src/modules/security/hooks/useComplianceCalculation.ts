import { useMemo } from 'react';
import type { SecurityNode, AuditColumn, ComplianceData, SecurityOverrides } from '../types/security.types';

/**
 * Hook for calculating compliance scores and data for security nodes
 * 
 * @param item - The node to calculate compliance for
 * @param auditCols - Array of audit columns to check compliance against
 * @param overrides - Manual compliance overrides
 * @returns Compliance data and score for the node
 */
export const useComplianceCalculation = (
    item: any,
    auditCols: AuditColumn[],
    overrides: SecurityOverrides
) => {
    return useMemo(() => {
        const compliance: Record<string, ComplianceData> = {};
        let score = 0;
        const colCount = auditCols.length || 1;
        const scorePerCol = 100 / colCount;

        auditCols.forEach(col => {
            // IMPROVED MATCHING LOGIC with multiple strategies

            // Strategy 1: Direct attribute match by ID
            const attrById = item.attributes?.find((a: any) => a.attributeId === col.id);

            // Strategy 2: Match by label (case-insensitive)
            const attrByLabel = item.attributes?.find((a: any) =>
                a.label?.toLowerCase() === col.label.toLowerCase()
            );

            // Strategy 3: Direct property access using column ID
            const directById = item[col.id];

            // Strategy 4: Direct property access using column key
            const directByKey = item[col.key];

            // Strategy 5: Fuzzy match on property names (fallback for legacy data)
            const normalize = (str: string) => str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]/g, '');
            const targetKey = normalize(col.label);
            const matchedKey = Object.keys(item).find(k => normalize(k) === targetKey);
            const fuzzyValue = matchedKey ? item[matchedKey] : undefined;

            // Extract the actual value from the matched attribute or property
            const matchedAttr = attrById || attrByLabel;
            const rawValue = matchedAttr?.value ?? directById ?? directByKey ?? fuzzyValue;

            // Check if value represents "true" / "active" / "compliant"
            const isActive = rawValue === true || rawValue === 1 ||
                (typeof rawValue === 'string' && ['sim', 'yes', 'true', 'ativo', 'active', 'on', 'ligado', '1'].includes(rawValue.toLowerCase()));

            // Apply manual override if exists
            const hasCompliance = overrides[`${item.id}_${col.key}`] || isActive;

            // Store compliance data
            compliance[col.key] = {
                native: isActive,
                current: hasCompliance,
                value: rawValue,
                matchStrategy: attrById ? 'attrById' : attrByLabel ? 'attrByLabel' : directById !== undefined ? 'directById' : directByKey !== undefined ? 'directByKey' : fuzzyValue !== undefined ? 'fuzzy' : 'none'
            };

            if (hasCompliance) score += scorePerCol;
        });

        const riskLevel = score > 90 ? 'LOW' as const : score > 50 ? 'MEDIUM' as const : 'HIGH' as const;

        return { compliance, score: Math.round(score), riskLevel };
    }, [item, auditCols, overrides]);
};
