import { useState, useCallback } from 'react';
import type { BlueprintAttribute, BlueprintNodeSchema, BlueprintSchema } from '../types/blueprint.types';

export const useSchema = (initialSchema?: BlueprintSchema) => {
    const [schema, setSchema] = useState<BlueprintSchema>(initialSchema || {
        id: 'default',
        name: 'New Blueprint',
        version: '1.0.0',
        nodes: [],
        globalAttributes: [],
        metadata: {
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            author: 'System'
        }
    });

    const addNodeSchema = useCallback((node: BlueprintNodeSchema) => {
        setSchema(prev => ({
            ...prev,
            nodes: [...prev.nodes, node],
            metadata: { ...prev.metadata, updatedAt: new Date().toISOString() }
        }));
    }, []);

    const updateNodeSchema = useCallback((nodeId: string, updates: Partial<BlueprintNodeSchema>) => {
        setSchema(prev => ({
            ...prev,
            nodes: prev.nodes.map(n => n.id === nodeId ? { ...n, ...updates } : n),
            metadata: { ...prev.metadata, updatedAt: new Date().toISOString() }
        }));
    }, []);

    const removeNodeSchema = useCallback((nodeId: string) => {
        setSchema(prev => ({
            ...prev,
            nodes: prev.nodes.filter(n => n.id !== nodeId),
            metadata: { ...prev.metadata, updatedAt: new Date().toISOString() }
        }));
    }, []);

    return {
        schema,
        setSchema,
        addNodeSchema,
        updateNodeSchema,
        removeNodeSchema
    };
};
