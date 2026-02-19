import React from 'react';
import { Edit2, Trash2 } from 'lucide-react';
import { AuditRow } from './AuditRow';
import type { SecurityNode, AuditColumn, SecurityOverrides } from '../types/security.types';

interface AuditMatrixProps {
    hierarchy: SecurityNode[];
    columns: AuditColumn[];
    onToggleOverride: (nodeId: string, columnKey: string) => void;
    canManageCols: boolean;
    overrides: SecurityOverrides;
    expandedIds: Set<string>;
    onToggleExpand: (id: string, e: React.MouseEvent) => void;
    editingCol: string | null;
    onEditColumn: (id: string) => void;
    onDeleteColumn: (id: string) => void;
    onRenameColumn: (id: string, newLabel: string) => void;
}

/**
 * AuditMatrix - Main table component for security audit
 * Displays hierarchical nodes with compliance data
 */
export const AuditMatrix: React.FC<AuditMatrixProps> = ({
    hierarchy,
    columns,
    onToggleOverride,
    canManageCols,
    overrides,
    expandedIds,
    onToggleExpand,
    editingCol,
    onEditColumn,
    onDeleteColumn,
    onRenameColumn
}) => {
    return (
        <div className="flex-1 overflow-auto custom-scrollbar">
            <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 bg-[#1c2128] z-10 border-b border-gray-800">
                    <tr>
                        <th className="px-8 py-5 text-[10px] font-black text-gray-500 uppercase tracking-widest">
                            Sovereign Node Entity
                        </th>

                        {columns.map((col) => (
                            <th key={col.id} className="px-8 py-5 text-[10px] font-black text-gray-500 uppercase tracking-widest text-center group relative">
                                {editingCol === col.id ? (
                                    <input
                                        type="text"
                                        defaultValue={col.label}
                                        onBlur={(e) => onRenameColumn(col.id, e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') onRenameColumn(col.id, e.currentTarget.value);
                                        }}
                                        autoFocus
                                        className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white text-[10px] font-black uppercase"
                                    />
                                ) : (
                                    <div className="flex items-center justify-center gap-2">
                                        <span>{col.label}</span>
                                    </div>
                                )}
                            </th>
                        ))}

                        <th className="px-8 py-5 text-[10px] font-black text-gray-500 uppercase tracking-widest text-center">
                            Compliance Score
                        </th>
                        <th className="px-8 py-5 text-[10px] font-black text-gray-500 uppercase tracking-widest text-right">
                            Risk Level
                        </th>
                    </tr>
                </thead>

                <tbody className="divide-y divide-gray-800/50">
                    {hierarchy.map((node: SecurityNode) => (
                        <AuditRow
                            key={node.id}
                            node={node}
                            columns={columns}
                            onToggleOverride={onToggleOverride}
                            canManageCols={canManageCols}
                            overrides={overrides}
                            expandedIds={expandedIds}
                            onToggleExpand={onToggleExpand}
                        />
                    ))}
                </tbody>
            </table>
        </div>
    );
};
