import { useMemo } from 'react';
import type { SecurityNode, AuditColumn, SecurityOverrides, SecurityStats } from '../types/security.types';
import { calculateNodeCompliance } from '../utils/complianceCalculator';

/**
 * Hook for managing security data and calculating global stats
 * Now supports filtering and hierarchical aggregation
 */
export const useSecurityData = (
    nodes: SecurityNode[],
    columns: AuditColumn[],
    overrides: SecurityOverrides,
    filterType: 'ALL' | 'SERVER' | 'SWITCH' | 'VM' = 'ALL'
) => {
    return useMemo(() => {
        let totalScore = 0;
        let monitoredNodes = 0;
        let protectedNodes = 0;
        let criticalGaps = 0;

        // Helper to check if a node matches the current filter
        const matchesFilter = (node: SecurityNode): boolean => {
            if (filterType === 'ALL') return true;
            if (node.type === 'POP') return false;

            const upperType = node.type?.toUpperCase().trim() || '';
            const upperFilter = filterType.toUpperCase();

            switch (upperFilter) {
                case 'SERVER':
                    return upperType === 'PHYSICAL_SERVER' || upperType === 'VIRTUAL_MACHINE' || upperType === 'SERVER';
                case 'SWITCH':
                    return upperType === 'SWITCH';
                case 'VM':
                    return upperType === 'VIRTUAL_MACHINE' || upperType === 'VM';
                default:
                    return upperType === upperFilter;
            }
        };

        const processNodeRecursively = (node: SecurityNode): SecurityNode | null => {
            // 1. Process Children First (Bottom-Up to allow aggregation)
            let processedChildren: SecurityNode[] = [];
            let hasMatchingDescendants = false;

            const childKeys = ['nodes', 'children', 'connected_devices', 'connected_servers', 'virtual_machines', 'systems'];

            // Clone node to avoid mutation
            const newNode: any = { ...node, processedChildren: [] };

            let childrenScores = 0;
            let childrenCount = 0;
            let childrenRiskLevels: string[] = [];

            childKeys.forEach(key => {
                if (Array.isArray(node[key as keyof SecurityNode])) {
                    const children = node[key as keyof SecurityNode] as SecurityNode[];
                    const mappedChildren = children
                        .map(child => processNodeRecursively(child))
                        .filter(child => child !== null) as SecurityNode[];

                    if (mappedChildren.length > 0) {
                        hasMatchingDescendants = true;
                        processedChildren = [...processedChildren, ...mappedChildren];

                        // Aggregate stats from children
                        mappedChildren.forEach(child => {
                            childrenScores += child.score || 0;
                            childrenCount++;
                            if (child.riskLevel) childrenRiskLevels.push(child.riskLevel);
                        });
                    }
                }
            });

            newNode.processedChildren = processedChildren;

            // 2. Determine if this node should be included
            const isMatch = matchesFilter(node);
            if (!isMatch && !hasMatchingDescendants) {
                return null;
            }

            // 3. Calculate Compliance & Score
            const complianceData = calculateNodeCompliance(node, columns, overrides);
            const hasChildrenCount = processedChildren.length > 0;
            const isPop = node.type === 'POP' || (!node.type && hasChildrenCount);

            if (isPop || hasChildrenCount) {
                // AGGREGATION MODE (For POPs or Grouping Nodes)
                const aggregatedScore = childrenCount > 0 ? Math.round(childrenScores / childrenCount) : 0;

                // Determine aggregated risk level
                let aggregatedRisk = 'LOW';
                if (childrenRiskLevels.includes('CRITICAL')) aggregatedRisk = 'CRITICAL';
                else if (childrenRiskLevels.includes('MEDIUM')) aggregatedRisk = 'MEDIUM';
                else if (childrenCount === 0) aggregatedRisk = 'MEDIUM';

                // If filtered entries exist, use their aggregate. 
                newNode.score = aggregatedScore;
                newNode.riskLevel = aggregatedRisk;
                newNode.compliance = complianceData.compliance; // Use local compliance for cells
                newNode.type = node.type || 'POP';

            } else {
                // LEAF NODE MODE (Device)
                newNode.score = complianceData.score;
                newNode.riskLevel = complianceData.riskLevel;
                newNode.compliance = complianceData.compliance;

                // Update Global Stats
                if (isMatch) {
                    totalScore += complianceData.score;
                    monitoredNodes++;
                    if (complianceData.score >= 80) protectedNodes++;
                    if (complianceData.score < 50) criticalGaps++;
                }
            }

            return newNode;
        };

        // Process each root node
        const processedNodes = nodes
            .map(node => processNodeRecursively(node))
            .filter(node => node !== null) as SecurityNode[];

        const avgScore = monitoredNodes > 0 ? Math.round(totalScore / monitoredNodes) : 0;

        const stats: SecurityStats = {
            total: monitoredNodes,
            protected_nodes: protectedNodes,
            critical_gaps: criticalGaps,
            avgScore
        };

        const globalRiskLevel = avgScore > 90 ? 'LOW' : avgScore >= 50 ? 'MEDIUM' : 'CRITICAL';

        return {
            processedNodes,
            stats,
            globalScore: avgScore,
            globalRiskLevel
        };
    }, [nodes, columns, overrides, filterType]);
};
