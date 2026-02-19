import { useState, useCallback } from 'react';
import type { BlueprintAttribute } from '../types/blueprint.types';

export const useAttributes = (initialAttributes?: BlueprintAttribute[]) => {
    const [attributes, setAttributes] = useState<BlueprintAttribute[]>(initialAttributes || []);

    const addAttribute = useCallback((attr: BlueprintAttribute) => {
        setAttributes(prev => [...prev, attr]);
    }, []);

    const updateAttribute = useCallback((id: string, updates: Partial<BlueprintAttribute>) => {
        setAttributes(prev => prev.map(a => a.id === id ? { ...a, ...updates } : a));
    }, []);

    const removeAttribute = useCallback((id: string) => {
        setAttributes(prev => prev.filter(a => a.id !== id));
    }, []);

    return {
        attributes,
        setAttributes,
        addAttribute,
        updateAttribute,
        removeAttribute
    };
};
