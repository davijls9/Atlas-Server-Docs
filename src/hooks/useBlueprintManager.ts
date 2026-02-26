import { useState, useCallback } from 'react';
import type { BlueprintMetadata } from '../types/app.types';
import { SecurityMiddleware } from '../utils/securityMiddleware';
import { CLEAN_BLUEPRINT_TEMPLATE } from '../constants/templates';

/**
 * Hook for managing blueprint operations and state
 */
export const useBlueprintManager = (
    currentUser: any,
    logEvent: (level: any, msg: string, src: string, details?: any) => void,
    showToast: (msg: string, type?: any) => void
) => {
    const [blueprintsRegistry, setBlueprintsRegistry] = useState<BlueprintMetadata[]>([]);
    const [activeBlueprintId, setActiveBlueprintId] = useState<string | null>(null);
    const [jsonPreview, setJsonPreview] = useState<string>('');
    const [jsonInput, setJsonInput] = useState<string>('');
    const [isSaved, setIsSaved] = useState(true);

    const switchBlueprint = useCallback((blueprintId: string) => {
        const blueprint = blueprintsRegistry.find(b => b.id === blueprintId);
        if (!blueprint) return;

        const activeKey = currentUser ? `atlas_active_bp_id_${currentUser.id}` : 'atlas_active_bp_id';
        setActiveBlueprintId(blueprintId);
        SecurityMiddleware.secureWrite(activeKey, blueprintId);

        const rawData = localStorage.getItem(blueprint.storageKey);
        let savedData = '';
        if (rawData) {
            try {
                // If it's stored as JSON-stringified string, parse it.
                // Otherwise fallback to raw string (though new data will always be JSON)
                savedData = JSON.parse(rawData);
            } catch (e) {
                savedData = rawData;
            }
        }
        if (!savedData || savedData === '[]' || savedData === '{}') {
            savedData = CLEAN_BLUEPRINT_TEMPLATE;
        }

        setJsonPreview(savedData);
        setJsonInput(savedData);
        setIsSaved(true);
        showToast(`Sovereign Context: ${blueprint.name}`, 'info');
        logEvent('INFO', `User switched context to: ${blueprint.name}`, 'WORKSPACE_ACTION', { blueprintId });
    }, [blueprintsRegistry, currentUser, logEvent, showToast]);

    const handleJsonChange = useCallback((newJson: string) => {
        setJsonPreview(newJson);
        setJsonInput(newJson);
        setIsSaved(false);

        const activeBlueprint = blueprintsRegistry.find(b => b.id === activeBlueprintId);
        if (activeBlueprint) {
            try {
                // Parse the edited JSON string to an object before storing
                // to avoid double-stringification in secureWrite
                const jsonObj = JSON.parse(newJson);
                SecurityMiddleware.secureWrite(activeBlueprint.storageKey, jsonObj);
            } catch (e) {
                // If it's partial/invalid JSON during typing, store as raw string
                SecurityMiddleware.secureWrite(activeBlueprint.storageKey, newJson);
            }
            setIsSaved(true);
        }
    }, [blueprintsRegistry, activeBlueprintId]);

    const handleManualSave = useCallback(() => {
        try {
            JSON.parse(jsonInput);
            setJsonPreview(jsonInput);

            const activeBlueprint = blueprintsRegistry.find(b => b.id === activeBlueprintId);
            if (!activeBlueprint) {
                showToast('No active blueprint context found', 'error');
                return;
            }

            const key = activeBlueprint.storageKey;
            SecurityMiddleware.secureWrite(key, jsonInput);

            if (activeBlueprintId) {
                const updatedRegistry = blueprintsRegistry.map(b =>
                    b.id === activeBlueprintId
                        ? { ...b, lastModified: new Date().toISOString() }
                        : b
                );
                setBlueprintsRegistry(updatedRegistry);
                SecurityMiddleware.secureWrite('atlas_blueprints_registry', updatedRegistry);
            }

            setIsSaved(true);
            showToast(`Blueprint "${activeBlueprint.name}" saved successfully`, 'success');
            logEvent('INFO', 'Manual blueprint save triggered', 'EDITOR_SAVE', { target: key, name: activeBlueprint.name });
        } catch (e) {
            showToast('Invalid JSON syntax', 'error');
        }
    }, [jsonInput, blueprintsRegistry, activeBlueprintId, logEvent, showToast]);

    const createBlueprint = useCallback((name: string, type: BlueprintMetadata['type'] = 'PERSONAL') => {
        const id = `bp_${Date.now()}`;
        const newBP: BlueprintMetadata = {
            id,
            name,
            ownerId: currentUser?.id || 'sys',
            ownerName: currentUser?.name || 'Authorized system',
            groupId: currentUser?.groupId || 'default',
            type,
            createdAt: new Date().toISOString(),
            lastModified: new Date().toISOString(),
            storageKey: `atlas_bp_data_${id}`,
            authorizedUserIds: type === 'GLOBAL' ? ['*'] : [currentUser?.id],
            authorizedGroupIds: type === 'SHARED' ? [currentUser?.groupId] : []
        };

        const updatedRegistry = [...blueprintsRegistry, newBP];
        setBlueprintsRegistry(updatedRegistry);
        SecurityMiddleware.secureWrite('atlas_blueprints_registry', updatedRegistry);

        try {
            // Template is a string containing JSON, we must parse it to avoid double-stringification
            const templateObj = JSON.parse(CLEAN_BLUEPRINT_TEMPLATE);
            SecurityMiddleware.secureWrite(newBP.storageKey, templateObj);
            setJsonPreview(CLEAN_BLUEPRINT_TEMPLATE);
            setJsonInput(CLEAN_BLUEPRINT_TEMPLATE);
        } catch (e) {
            SecurityMiddleware.secureWrite(newBP.storageKey, CLEAN_BLUEPRINT_TEMPLATE);
            setJsonPreview(CLEAN_BLUEPRINT_TEMPLATE);
            setJsonInput(CLEAN_BLUEPRINT_TEMPLATE);
        }
        setIsSaved(true);

        const activeKey = currentUser ? `atlas_active_bp_id_${currentUser.id}` : 'atlas_active_bp_id';
        setActiveBlueprintId(id);
        SecurityMiddleware.secureWrite(activeKey, id);

        showToast(`Blueprint "${name}" created`, 'success');
        logEvent('INFO', `User created blueprint: ${name}`, 'WORKSPACE_ACTION', { blueprintId: id, type });
    }, [blueprintsRegistry, currentUser, logEvent, showToast]);

    const deleteBlueprint = useCallback((blueprintId: string) => {
        const blueprint = blueprintsRegistry.find(b => b.id === blueprintId);
        if (!blueprint) return;

        if (blueprintId === activeBlueprintId) {
            showToast('Cannot delete active blueprint', 'error');
            return;
        }

        const updatedRegistry = blueprintsRegistry.filter(b => b.id !== blueprintId);
        setBlueprintsRegistry(updatedRegistry);
        SecurityMiddleware.secureWrite('atlas_blueprints_registry', updatedRegistry);
        localStorage.removeItem(blueprint.storageKey);

        showToast(`Blueprint "${blueprint.name}" deleted`, 'success');
        logEvent('WARN', `User deleted blueprint: ${blueprint.name}`, 'WORKSPACE_ACTION', { blueprintId });
    }, [blueprintsRegistry, activeBlueprintId, logEvent, showToast]);

    return {
        blueprintsRegistry,
        setBlueprintsRegistry,
        activeBlueprintId,
        setActiveBlueprintId,
        jsonPreview,
        setJsonPreview,
        jsonInput,
        setJsonInput,
        isSaved,
        setIsSaved,
        switchBlueprint,
        handleJsonChange,
        handleManualSave,
        createBlueprint,
        deleteBlueprint
    };
};
