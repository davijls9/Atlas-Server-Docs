import { useState, useRef, useEffect, useCallback } from 'react';
import type { NodeType, BlueprintAttribute, InfraNode, Pop, Link, NodeAttributeValue } from '../types/blueprint.types';

// Pure helper function - Moved outside to prevent Hook Order issues and recreation
const normalizeNodes = (nodes: any[]): InfraNode[] => {
    return nodes.map((n: any) => {
        const childrenRaw = n.children || n.connected_devices || n.connected_servers || n.virtual_machines || n.systems || [];
        return {
            ...n,
            type: (n.type || '').toUpperCase() as NodeType,
            attributes: n.attributes || [],
            children: normalizeNodes(childrenRaw)
        };
    });
};

export const useBlueprintNodes = (initialData?: string, schema: BlueprintAttribute[] = []) => {
    const [pops, setPops] = useState<Pop[]>([]);
    const [links, setLinks] = useState<Link[]>([]);

    // Sync Ref to prevent loops
    const lastSyncedJson = useRef<string | null>(null);

    // Initialize/Sync
    useEffect(() => {
        // Only run if initialData exists and differs from what we last processed
        if (initialData && initialData !== lastSyncedJson.current) {
            try {
                const parsed = JSON.parse(initialData);
                const incomingPopsRaw = parsed.pops || (Array.isArray(parsed) ? parsed : []);
                const incomingLinks = parsed.links || [];

                const incomingPops = incomingPopsRaw.map((p: any) => ({
                    ...p,
                    nodes: normalizeNodes(p.nodes || [])
                }));

                // Update state only if deep content differs
                setPops(prevPops => {
                    if (JSON.stringify(incomingPops) !== JSON.stringify(prevPops)) {
                        return incomingPops;
                    }
                    return prevPops;
                });

                setLinks(prevLinks => {
                    if (JSON.stringify(incomingLinks) !== JSON.stringify(prevLinks)) {
                        return incomingLinks;
                    }
                    return prevLinks;
                });

                lastSyncedJson.current = initialData;
            } catch (e) {
                console.error("Failed to parse initialData in useBlueprintNodes", e);
            }
        } else if (!initialData) {
            // Handle case where initialData is cleared (unlikely but good for null safety)
            lastSyncedJson.current = null;
        }
    }, [initialData]);

    // Helpers
    const serializeNode = useCallback((node: InfraNode): any => {
        const attrs: Record<string, any> = {};
        // Use schema to populate dynamic keys if needed, but ensure stability
        node.attributes.forEach((av: NodeAttributeValue) => {
            const attr = schema.find((s) => s.id === av.attributeId);
            if (attr) attrs[attr.label.toLowerCase().replace(/ /g, '_')] = av.value;
        });

        const base = {
            id: node.id,
            name: node.name,
            ip: node.ip,
            status: node.status,
            criticality: node.criticality,
            type: node.type.toLowerCase(),
            ...attrs,
            attributes: node.attributes
        };

        const childrenSerialized = node.children?.map(serializeNode) || [];

        if (node.type === 'SWITCH') return { ...base, connected_servers: childrenSerialized };
        if (node.type === 'PHYSICAL_SERVER') return { ...base, virtual_machines: childrenSerialized };
        if (node.type === 'VIRTUAL_MACHINE') return { ...base, systems: childrenSerialized };
        return { ...base, children: childrenSerialized };
    }, [schema]);

    // Node Operations - Wrapped in useCallback to ensure stable references
    const addPop = useCallback(() => {
        const id = `pop-${Date.now()}`;
        const newPop = { id, name: 'New POP', city: 'City', nodes: [] };
        setPops(prev => [...prev, newPop]);
    }, []);

    const removePop = useCallback((id: string) => {
        setPops(prev => prev.filter(p => p.id !== id));
    }, []);

    const addNode = useCallback((parentId: string, type: NodeType = 'PHYSICAL_SERVER') => {
        const id = `node-${Date.now()}`;
        const newNode: InfraNode = {
            id,
            name: `New ${type.replace('_', ' ')}`,
            type,
            ip: '0.0.0.0',
            status: 'OFF',
            criticality: 'MEDIUM',
            attributes: [],
            interfaces: []
        };

        setPops(prev => prev.map(p => {
            const updateNodes = (nodes: InfraNode[]): InfraNode[] => {
                return nodes.map(n => {
                    if (n.id === parentId) return { ...n, children: [...(n.children || []), newNode] };
                    if (n.children) return { ...n, children: updateNodes(n.children) };
                    return n;
                });
            };
            if (p.id === parentId) return { ...p, nodes: [...p.nodes, newNode] };
            return { ...p, nodes: updateNodes(p.nodes) };
        }));
    }, []);

    const removeNode = useCallback((nodeId: string) => {
        setPops(prev => prev.map(p => {
            const removeFromList = (nodes: InfraNode[]): InfraNode[] => {
                return nodes.filter(n => n.id !== nodeId).map(n => ({
                    ...n,
                    children: n.children ? removeFromList(n.children) : []
                }));
            };
            return { ...p, nodes: removeFromList(p.nodes) };
        }));
    }, []);

    const updateNode = useCallback((nodeId: string, updates: Partial<InfraNode>) => {
        setPops(prev => prev.map(pop => ({
            ...pop,
            nodes: pop.nodes.map(node => {
                if (node.id === nodeId) return { ...node, ...updates };

                const updateChildren = (children: any[]): any[] => {
                    return children.map(child => {
                        if (child.id === nodeId) return { ...child, ...updates };
                        const key = ['children', 'connected_devices', 'connected_servers', 'virtual_machines', 'systems'].find(k => Array.isArray(child[k]));
                        if (key && child[key].length > 0) {
                            return { ...child, [key]: updateChildren((child as any)[key]) };
                        }
                        return child;
                    });
                };

                const childKey = ['children', 'connected_devices', 'connected_servers', 'virtual_machines', 'systems'].find(k => Array.isArray((node as any)[k]));
                if (childKey && (node as any)[childKey].length > 0) {
                    return { ...node, [childKey]: updateChildren((node as any)[childKey]) };
                }
                return node;
            })
        })));
    }, []);

    const updateNodeAttribute = useCallback((nodeId: string, attrId: string, value: any) => {
        setPops(prev => prev.map(p => {
            if (p.id === nodeId) {
                if (attrId === 'name') return { ...p, name: value };
                if (attrId === 'city') return { ...p, city: value };
            }
            const updateInList = (nodes: InfraNode[]): InfraNode[] => {
                return nodes.map(n => {
                    if (n.id === nodeId) {
                        if (attrId === 'name') return { ...n, name: value };
                        if (attrId === 'ip') return { ...n, ip: value };

                        const existing = n.attributes.find(a => a.attributeId === attrId);
                        const newAttrs = existing
                            ? n.attributes.map(a => a.attributeId === attrId ? { ...a, value } : a)
                            : [...n.attributes, { attributeId: attrId, value }];
                        return { ...n, attributes: newAttrs };
                    }
                    if (n.children) return { ...n, children: updateInList(n.children) };
                    return n;
                });
            };
            return { ...p, nodes: updateInList(p.nodes) };
        }));
    }, []);

    // Helper to find node by ID
    const findNodeById = useCallback((id: string, nodes: InfraNode[]): InfraNode | null => {
        for (const n of nodes) {
            if (n.id === id) return n;
            if (n.children) {
                const found = findNodeById(id, n.children);
                if (found) return found;
            }
        }
        return null;
    }, []);

    return {
        pops,
        setPops,
        links,
        setLinks,
        addPop,
        removePop,
        addNode,
        removeNode,
        updateNode,
        updateNodeAttribute,
        findNodeById,
        serializeNode
    };
};
