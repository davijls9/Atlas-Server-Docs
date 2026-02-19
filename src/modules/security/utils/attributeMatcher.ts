import type { AuditColumn } from '../types/security.types';
import { normalizeString } from './complianceCalculator';

export type MatchStrategy = 'attrById' | 'attrByLabel' | 'directById' | 'directByKey' | 'fuzzy' | 'none';

export interface MatchResult {
    value: any;
    strategy: MatchStrategy;
    found: boolean;
}

/**
 * Match attribute value using multiple strategies
 * 
 * @param item - The node/item to search in
 * @param column - The audit column to match
 * @returns Match result with value and strategy used
 */
export const matchAttribute = (item: any, column: AuditColumn): MatchResult => {
    // Strategy 1: Direct attribute match by ID
    const attrById = item.attributes?.find((a: any) => a.attributeId === column.id);
    if (attrById) {
        return { value: attrById.value, strategy: 'attrById', found: true };
    }

    // Strategy 2: Match by label (case-insensitive)
    const attrByLabel = item.attributes?.find((a: any) =>
        a.label?.toLowerCase() === column.label.toLowerCase()
    );
    if (attrByLabel) {
        return { value: attrByLabel.value, strategy: 'attrByLabel', found: true };
    }

    // Strategy 3: Direct property access using column ID
    const directById = item[column.id];
    if (directById !== undefined) {
        return { value: directById, strategy: 'directById', found: true };
    }

    // Strategy 4: Direct property access using column key
    const directByKey = item[column.key];
    if (directByKey !== undefined) {
        return { value: directByKey, strategy: 'directByKey', found: true };
    }

    // Strategy 5: Fuzzy match on property names (fallback for legacy data)
    const targetKey = normalizeString(column.label);
    const matchedKey = Object.keys(item).find(k => normalizeString(k) === targetKey);
    if (matchedKey) {
        return { value: item[matchedKey], strategy: 'fuzzy', found: true };
    }

    // No match found
    return { value: undefined, strategy: 'none', found: false };
};
