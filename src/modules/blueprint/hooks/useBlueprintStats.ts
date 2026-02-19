import { useMemo } from 'react';
import type { InfraNode, NodeAttributeValue, Pop } from '../types/blueprint.types';

export const useBlueprintStats = (pops: Pop[], selectedNodeId: string | null, findNodeById: (id: string, nodes: InfraNode[]) => InfraNode | null) => {
    return useMemo(() => {
        let physicalRAM = 0;
        let virtualRAM = 0;
        let vcpuCount = 0;

        const processNode = (n: InfraNode) => {
            // Robust RAM detection: Try ID first, then fuzzy match label
            const getRamValue = (node: InfraNode) => {
                const byId = node.attributes.find((a: NodeAttributeValue) => a.attributeId === 'attr-ram-val-1')?.value;
                if (byId !== undefined) return byId;

                // Fallback: search for any attribute with "RAM" in its ID or label
                const fuzzy = node.attributes.find((a: NodeAttributeValue) =>
                    a.attributeId.toLowerCase().includes('ram') ||
                    (a as any).label?.toLowerCase().includes('ram')
                )?.value;
                return fuzzy || '0';
            };

            const val = getRamValue(n);
            const match = String(val).match(/\d+/);
            const amount = match ? parseInt(match[0]) : 0;

            if (n.type === 'PHYSICAL_SERVER') {
                physicalRAM += amount;
            } else if (n.type === 'VIRTUAL_MACHINE') {
                virtualRAM += amount;
            }

            if (n.children) n.children.forEach(processNode);
        };

        if (selectedNodeId) {
            const flatNodes = pops.flatMap(p => p.nodes);
            const target = pops.find(p => p.id === selectedNodeId) || findNodeById(selectedNodeId, flatNodes);

            if (target) {
                if ('nodes' in target) {
                    // It's a POP
                    (target as Pop).nodes.forEach(processNode);
                } else {
                    // It's a Node
                    processNode(target as InfraNode);
                }
            }
        } else {
            // Global selection
            pops.forEach(p => p.nodes.forEach(processNode));
        }

        const efficiency = physicalRAM > 0 ? (virtualRAM / physicalRAM) * 100 : 0;
        return { physicalRAM, virtualRAM, vcpuCount, efficiency };
    }, [pops, selectedNodeId, findNodeById]);
};
